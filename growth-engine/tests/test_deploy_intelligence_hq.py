"""Unit tests for growth-engine/automations/deploy_intelligence_hq.py

These are lightweight tests that validate prompt parsing and the API helper's
behavior using mocks of urllib.request.urlopen. They do not call the real
OpenHands API.
"""
import io
import json
import unittest
from unittest import mock
from urllib.error import HTTPError

import growth_engine.automations.deploy_intelligence_hq as deploy


class TestPromptParsing(unittest.TestCase):
    def test_prompt_body_ok(self):
        text = "Header\n---\nThis is the prompt body\n"
        m = mock.mock_open(read_data=text)
        with mock.patch("builtins.open", m):
            result = deploy.prompt_body("dummy.path")
            self.assertIn("This is the prompt body", result)

    def test_prompt_body_missing(self):
        m = mock.mock_open()
        m.side_effect = FileNotFoundError
        with mock.patch("builtins.open", m):
            with self.assertRaises(SystemExit):
                deploy.prompt_body("missing.path")


class DummyResponse:
    def __init__(self, status=200, body="{}"):  # body must be bytes when read()
        self.status = status
        self._body = body.encode()

    def read(self):
        return self._body

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc, tb):
        return False


class TestAPIHelpers(unittest.TestCase):
    @mock.patch("growth_engine.automations.deploy_intelligence_hq.urllib.request.urlopen")
    def test_request_with_retry_success(self, mock_urlopen):
        mock_urlopen.return_value = DummyResponse(200, json.dumps({"automations": []}))
        status, data = deploy._request_with_retry("GET", "http://example", "tok")
        self.assertEqual(status, 200)
        self.assertIsInstance(data, dict)

    @mock.patch("growth_engine.automations.deploy_intelligence_hq.urllib.request.urlopen")
    def test_request_with_retry_http_error_retry(self, mock_urlopen):
        # Simulate HTTPError with 500 then success
        body = b"server error"
        http_err = HTTPError(url='http://', code=500, msg='err', hdrs=None, fp=io.BytesIO(body))
        mock_urlopen.side_effect = [http_err, DummyResponse(200, json.dumps({}))]
        status, data = deploy._request_with_retry("GET", "http://example", "tok")
        self.assertEqual(status, 200)


if __name__ == "__main__":
    unittest.main()
