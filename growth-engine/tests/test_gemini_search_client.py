#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Tests for the Gemini Search-grounded client.

No network access and no API key required: every test uses a fake opener, so the
suite is safe to run in CI and by the daily automation.

Run:  python3 -m unittest discover -s growth-engine/tests -v
"""
import io
import json
import os
import sys
import unittest
import urllib.error

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.insert(0, os.path.join(ROOT, "growth-engine"))

import gemini_search_client as G  # noqa: E402


def _body(answer, queries=None, chunks=None, finish="STOP"):
    return {
        "candidates": [{
            "finishReason": finish,
            "content": {"parts": [{"text": answer}]},
            "groundingMetadata": {
                "webSearchQueries": queries or ["plumber laguna niguel"],
                "groundingChunks": [{"web": c} for c in (chunks or [])],
            },
        }],
        "usageMetadata": {"promptTokenCount": 12, "candidatesTokenCount": 88,
                          "totalTokenCount": 100},
    }


class FakeResponse(io.BytesIO):
    def __init__(self, obj):
        super().__init__(json.dumps(obj).encode("utf-8"))

    def __enter__(self):
        return self

    def __exit__(self, *a):
        return False


class FakeOpener:
    def __init__(self, responses):
        self._responses = list(responses)
        self.calls = []

    def __call__(self, req, timeout=None):
        self.calls.append(req)
        item = self._responses.pop(0)
        if isinstance(item, Exception):
            raise item
        return FakeResponse(item)


def _http_error(code, body, retry_after=None):
    hdrs = {"Content-Type": "application/json"}
    if retry_after is not None:
        hdrs["Retry-After"] = str(retry_after)
    fp = io.BytesIO(json.dumps(body).encode("utf-8"))
    return urllib.error.HTTPError(
        "https://x", code, "err", type("H", (), {"get": lambda s, k, d=None: hdrs.get(k)})(), fp)


class KeyTests(unittest.TestCase):
    def setUp(self):
        self._saved = {k: os.environ.pop(k, None) for k in G.API_KEY_ENV_VARS}

    def tearDown(self):
        for k, v in self._saved.items():
            if v is not None:
                os.environ[k] = v

    def test_present_false_when_unset(self):
        self.assertFalse(G.api_key_present())

    def test_present_true_when_set(self):
        os.environ["GEMINI_API_KEY"] = "abc"
        self.assertTrue(G.api_key_present())

    def test_present_true_for_platform_cased_secret(self):
        os.environ["Gemini_api_key"] = "abc"
        self.assertTrue(G.api_key_present())

    def test_canonical_name_wins(self):
        os.environ["Gemini_api_key"] = "lower"
        os.environ["GEMINI_API_KEY"] = "upper"
        self.assertEqual(G._env_api_key(), "upper")

    def test_missing_key_raises_authentication_failed(self):
        with self.assertRaises(G.GeminiError) as ctx:
            G.GeminiClient().ask("q")
        self.assertEqual(ctx.exception.error_type, "authentication_failed")

    def test_error_dict_never_contains_key(self):
        client = G.GeminiClient(api_key="super-secret", opener=FakeOpener([
            _http_error(401, {"error": {"status": "UNAUTHENTICATED"}})]))
        try:
            client.ask("q")
            self.fail("expected")
        except G.GeminiError as exc:
            self.assertNotIn("super-secret", json.dumps(exc.as_dict()))


class ErrorTaxonomyTests(unittest.TestCase):
    def test_unauthenticated_maps_to_auth(self):
        self.assertEqual(G._error_type_for(401, "UNAUTHENTICATED"),
                         "authentication_failed")

    def test_resource_exhausted_maps_to_rate_limited(self):
        self.assertEqual(G._error_type_for(429, "RESOURCE_EXHAUSTED"), "rate_limited")

    def test_invalid_argument_maps_to_bad_request(self):
        self.assertEqual(G._error_type_for(400, "INVALID_ARGUMENT"), "bad_request")

    def test_availability_maps_to_server_error(self):
        self.assertEqual(G._error_type_for(503, "UNAVAILABLE"), "server_error")

    def test_status_only_fallback(self):
        self.assertEqual(G._error_type_for(500), "server_error")
        self.assertEqual(G._error_type_for(429), "rate_limited")

    def test_every_type_in_taxonomy(self):
        for code in (401, 403, 429, 400, 404, 422, 500, 503, 999):
            self.assertIn(G._error_type_for(code), G.ERROR_TYPES)


class ClassifyTests(unittest.TestCase):
    def test_absent_when_not_mentioned(self):
        self.assertEqual(G.classify_visibility("Try Bob's Plumbing.", [], []), "absent")

    def test_cited_when_sf_url_in_sources(self):
        src = [{"url": "https://straightflushplumbingoc.com/x"}]
        self.assertEqual(G.classify_visibility("Yes.", src, []), "cited")

    def test_recommended(self):
        txt = "I recommend Straight Flush Plumbing & Leak Detection for that."
        self.assertEqual(G.classify_visibility(txt, [], []), "recommended")

    def test_mentioned_without_recommendation(self):
        txt = "Straight Flush Plumbing & Leak Detection also serves the area."
        self.assertEqual(G.classify_visibility(txt, [], []), "mentioned")

    def test_empty_is_inconclusive(self):
        self.assertEqual(G.classify_visibility("", [], []), "inconclusive")

    def test_never_returns_incorrect(self):
        for txt in ("Straight Flush Plumbing is bad", "Straight Flush Plumbing"):
            self.assertNotEqual(G.classify_visibility(txt, [], []), "incorrect")


class NormaliseTests(unittest.TestCase):
    def test_extracts_answer_sources_queries_usage(self):
        client = G.GeminiClient(api_key="k", opener=FakeOpener([_body(
            "Straight Flush Plumbing is a good choice.",
            chunks=[{"uri": "https://straightflushplumbingoc.com/a", "title": "SF"},
                    {"uri": "https://other.com/b", "title": "O"}])]))
        r = client.ask("q")
        self.assertTrue(r["ok"])
        self.assertIn("Straight Flush", r["answer"])
        self.assertEqual(len(r["sources"]), 2)
        self.assertEqual(r["domains"], ["straightflushplumbingoc.com", "other.com"])
        self.assertEqual(r["search_queries"], ["plumber laguna niguel"])
        self.assertEqual(r["usage"]["totalTokenCount"], 100)

    def test_dedupes_sources(self):
        client = G.GeminiClient(api_key="k", opener=FakeOpener([_body(
            "a", chunks=[{"uri": "https://x.com/1"}, {"uri": "https://x.com/1"}])]))
        self.assertEqual(len(client.ask("q")["sources"]), 1)

    def test_no_grounding_chunks_is_empty_not_error(self):
        client = G.GeminiClient(api_key="k", opener=FakeOpener([_body("no sources", chunks=[])]))
        r = client.ask("q")
        self.assertEqual(r["sources"], [])
        self.assertEqual(r["domains"], [])


class RequestTests(unittest.TestCase):
    def test_sends_search_tool_and_key_header(self):
        opener = FakeOpener([_body("ok")])
        client = G.GeminiClient(api_key="k", model="gemini-2.5-flash", opener=opener)
        client.ask("q")
        req = opener.calls[0]
        payload = json.loads(req.data.decode("utf-8"))
        self.assertEqual(payload["tools"], [{"google_search": {}}])
        self.assertEqual(req.headers.get("X-goog-api-key"), "k")
        self.assertIn("gemini-2.5-flash:generateContent", req.full_url)


class RetryTests(unittest.TestCase):
    def test_retries_rate_limit_then_succeeds(self):
        opener = FakeOpener([
            _http_error(429, {"error": {"status": "RESOURCE_EXHAUSTED"}}, retry_after=1),
            _body("recovered")])
        client = G.GeminiClient(api_key="k", opener=opener, sleep=lambda s: None)
        self.assertTrue(client.ask("q")["ok"])
        self.assertEqual(len(opener.calls), 2)

    def test_honours_retry_after(self):
        slept = []
        opener = FakeOpener([
            _http_error(429, {"error": {"status": "RESOURCE_EXHAUSTED"}}, retry_after=7),
            _body("ok")])
        G.GeminiClient(api_key="k", opener=opener, sleep=slept.append).ask("q")
        self.assertEqual(slept, [7])

    def test_gives_up_after_max_retries(self):
        opener = FakeOpener([_http_error(500, {"error": {"status": "INTERNAL"}})] * 3)
        client = G.GeminiClient(api_key="k", opener=opener, max_retries=3,
                                sleep=lambda s: None)
        with self.assertRaises(G.GeminiError):
            client.ask("q")
        self.assertEqual(len(opener.calls), 3)

    def test_does_not_retry_bad_request(self):
        opener = FakeOpener([_http_error(400, {"error": {"status": "INVALID_ARGUMENT"}})])
        client = G.GeminiClient(api_key="k", opener=opener, sleep=lambda s: None)
        with self.assertRaises(G.GeminiError):
            client.ask("q")
        self.assertEqual(len(opener.calls), 1)

    def test_does_not_retry_auth(self):
        opener = FakeOpener([_http_error(403, {"error": {"status": "PERMISSION_DENIED"}})])
        client = G.GeminiClient(api_key="k", opener=opener, sleep=lambda s: None)
        with self.assertRaises(G.GeminiError):
            client.ask("q")
        self.assertEqual(len(opener.calls), 1)


class RecordTests(unittest.TestCase):
    def test_success_record_matches_jsonl_schema(self):
        result = {"ok": True, "model": "gemini-2.5-flash", "answer": "Straight Flush Plumbing rocks",
                  "sources": [{"url": "https://straightflushplumbingoc.com/a"}],
                  "citations": [{"url": "https://straightflushplumbingoc.com/a"}],
                  "domains": ["straightflushplumbingoc.com"], "search_queries": ["q"],
                  "usage": {"totalTokenCount": 5}}
        rec = G.build_record("plumber", "Laguna Niguel", result)
        for field in ("ts", "platform", "test_type", "query", "city", "web_search",
                      "straight_flush", "top_results", "confidence", "note"):
            self.assertIn(field, rec)
        self.assertEqual(rec["platform"], "gemini_search")
        self.assertEqual(rec["test_type"], "ai_platform")
        self.assertEqual(rec["straight_flush"], "cited")
        self.assertNotIn("answer", rec)  # full answer is never stored

    def test_failure_record_is_inconclusive_not_absent(self):
        rec = G.build_record("q", "c", {"ok": False, "error_type": "rate_limited",
                                        "status_code": 429, "message": "slow down"})
        self.assertEqual(rec["straight_flush"], "inconclusive")
        self.assertEqual(rec["test_type"], "test_failure")
        self.assertEqual(rec["error_type"], "rate_limited")

    def test_unknown_error_type_falls_back(self):
        rec = G.build_record("q", "c", {"ok": False, "error_type": "weird"})
        self.assertEqual(rec["error_type"], "unknown_error")

    def test_record_never_contains_key(self):
        rec = G.build_record("q", "c", {"ok": True, "answer": "x", "model": "m"})
        self.assertNotIn("key", json.dumps(rec).lower())

    def test_appends_jsonl_lines(self):
        import tempfile
        with tempfile.TemporaryDirectory() as d:
            path = os.path.join(d, "sub", "h.jsonl")
            n = G.append_records(path, [{"a": 1}, {"b": 2}])
            self.assertEqual(n, 2)
            with open(path) as fh:
                self.assertEqual(len(fh.read().strip().splitlines()), 2)


class ModelChainTests(unittest.TestCase):
    """A slug Google retires must not zero the day's AI sweep.

    `gemini-2.5-flash` began answering 404 "no longer available to new users",
    which made every grounded query inconclusive.
    """

    def test_default_model_is_the_stable_latest_alias(self):
        self.assertEqual(G.DEFAULT_MODEL, "gemini-flash-latest")

    def test_retired_default_slug_is_not_reinstated(self):
        self.assertNotEqual(G.DEFAULT_MODEL, "gemini-2.5-flash")

    def test_default_chain_starts_with_default_and_is_unique(self):
        client = G.GeminiClient(api_key="k", opener=FakeOpener([]))
        self.assertEqual(client._models[0], G.DEFAULT_MODEL)
        self.assertEqual(len(client._models), len(set(client._models)))
        self.assertIn("gemini-2.5-flash", client._models)

    def test_explicit_model_pins_a_single_slug(self):
        client = G.GeminiClient(api_key="k", model="gemini-3.5-flash",
                                opener=FakeOpener([]))
        self.assertEqual(client._models, ["gemini-3.5-flash"])

    def test_env_model_pins_a_single_slug(self):
        os.environ["GEMINI_MODEL"] = "gemini-3.5-flash"
        try:
            client = G.GeminiClient(api_key="k", opener=FakeOpener([]))
            self.assertEqual(client._models, ["gemini-3.5-flash"])
        finally:
            del os.environ["GEMINI_MODEL"]

    def test_falls_back_when_a_slug_is_retired(self):
        opener = FakeOpener([
            _http_error(404, {"error": {"status": "NOT_FOUND",
                                        "message": "model is no longer available to new users"}}),
            _body("plumber found"),
        ])
        client = G.GeminiClient(api_key="k", opener=opener, sleep=lambda s: None,
                                model_fallbacks=["gemini-3.8-flash"])
        result = client.ask("q")
        self.assertTrue(result["ok"])
        self.assertEqual(len(opener.calls), 2)
        self.assertIn("gemini-3.8-flash", opener.calls[1].full_url)

    def test_does_not_fall_back_on_other_404(self):
        opener = FakeOpener([
            _http_error(404, {"error": {"status": "NOT_FOUND",
                                        "message": "model not found"}}),
        ])
        client = G.GeminiClient(api_key="k", opener=opener, sleep=lambda s: None,
                                model_fallbacks=["gemini-3.8-flash"])
        with self.assertRaises(G.GeminiError):
            client.ask("q")
        self.assertEqual(len(opener.calls), 1)

    def test_exhausted_chain_raises_the_last_error(self):
        retired = _http_error(404, {"error": {"status": "NOT_FOUND",
                                              "message": "no longer available"}})
        opener = FakeOpener([retired, _http_error(
            404, {"error": {"status": "NOT_FOUND", "message": "no longer available"}})])
        client = G.GeminiClient(api_key="k", opener=opener, sleep=lambda s: None,
                                model_fallbacks=["gemini-3.8-flash"])
        with self.assertRaises(G.GeminiError) as ctx:
            client.ask("q")
        self.assertEqual(ctx.exception.status_code, 404)
        self.assertEqual(len(opener.calls), 2)

    def test_grounding_429_still_raises_rate_limited(self):
        """A blocked grounding sweep stays inconclusive, never absent."""
        opener = FakeOpener([_http_error(429, {"error": {"status": "RESOURCE_EXHAUSTED"}})] * 3)
        client = G.GeminiClient(api_key="k", opener=opener, sleep=lambda s: None)
        with self.assertRaises(G.GeminiError) as ctx:
            client.ask("q")
        self.assertEqual(ctx.exception.error_type, "rate_limited")


if __name__ == "__main__":
    unittest.main()
