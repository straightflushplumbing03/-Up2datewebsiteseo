# -*- coding: utf-8 -*-
"""
Custom SVG icon system — replaces emoji glyphs site-wide with a consistent,
premium, hand-drawn line-icon set (24x24 viewBox, stroke=currentColor).
Icons scale with font-size via width/height:1em, matching how the emoji
they replace used to behave, so no surrounding CSS needs to change.
"""

def _svg(paths, viewbox="0 0 24 24", extra=""):
    return (f'<svg class="ico" viewBox="{viewbox}" width="1em" height="1em" '
            f'fill="none" stroke="currentColor" stroke-width="1.8" '
            f'stroke-linecap="round" stroke-linejoin="round" '
            f'style="display:inline-block;vertical-align:-0.15em;" {extra}>{paths}</svg>')

ICONS = {
    # entity sequence (as it appears in HTML) -> svg markup
    "&#10003;": _svg('<path d="M4 12.5l5 5L20 6"/>'),  # check
    "&#9989;": _svg('<circle cx="12" cy="12" r="9"/><path d="M8 12.5l2.5 2.5L16 9.5"/>'),  # check-circle
    "&#128205;": _svg('<path d="M12 21s7-6.4 7-12a7 7 0 1 0-14 0c0 5.6 7 12 7 12z"/><circle cx="12" cy="9" r="2.4"/>'),  # pin
    "&#128222;": _svg('<path d="M5 4.5c0-.6.4-1 1-1h2.6c.5 0 .9.3 1 .8l.8 3.3c.1.4 0 .9-.3 1.2L8.7 10c1 2.4 3 4.3 5.3 5.3l1.2-1.4c.3-.3.7-.4 1.2-.3l3.3.8c.5.1.8.5.8 1V18.5c0 .6-.4 1-1 1C10.5 19.5 4.5 13.5 4.5 6z"/>'),  # phone
    "&#128167;": _svg('<path d="M12 3s6 7 6 11.2A6 6 0 1 1 6 14.2C6 10 12 3 12 3z"/>'),  # droplet
    "&#10084;&#65039;": _svg('<path d="M12 20.5s-7.5-4.7-9.8-9.3C.7 8 2.2 4.5 5.6 3.7c2-.5 4 .3 5 2 1-1.7 3-2.5 5-2 3.4.8 4.9 4.3 3.4 7.5-2.3 4.6-9.8 9.3-9.8 9.3z"/>'),
    "&#127777;&#65039;": _svg('<path d="M12 3a2 2 0 0 1 2 2v8.5a4 4 0 1 1-4 0V5a2 2 0 0 1 2-2z"/><line x1="12" y1="8" x2="12" y2="13.5"/>'),  # thermometer
    "&#128176;": _svg('<circle cx="12" cy="12" r="9"/><path d="M9.5 15c0 1 1 1.8 2.5 1.8s2.5-.8 2.5-1.8c0-1-1-1.5-2.5-1.8-1.5-.3-2.5-.8-2.5-1.8 0-1 1-1.8 2.5-1.8s2.5.8 2.5 1.8"/><line x1="12" y1="7" x2="12" y2="8.2"/><line x1="12" y1="15.8" x2="12" y2="17"/>'),  # dollar/high-bill
    "&#128184;": _svg('<path d="M4 16c2-4 4-6 8-6s6 2 8 6"/><circle cx="12" cy="9" r="2.2"/><path d="M4 16c1.5 1 3 1.5 4 1.5M20 16c-1.5 1-3 1.5-4 1.5"/>'),  # faucet/kitchen
    "&#128197;": _svg('<rect x="3.5" y="5" width="17" height="15.5" rx="2"/><line x1="3.5" y1="9.5" x2="20.5" y2="9.5"/><line x1="8" y1="3" x2="8" y2="7"/><line x1="16" y1="3" x2="16" y2="7"/>'),  # calendar
    "&#128202;": _svg('<line x1="5" y1="20" x2="5" y2="12"/><line x1="12" y1="20" x2="12" y2="7"/><line x1="19" y1="20" x2="19" y2="15"/>'),  # gauge/pressure
    "&#128293;": _svg('<path d="M12 22c4 0 6.5-2.7 6.5-6.2 0-2.7-1.6-4.5-2.8-6-0.3 1.6-1 2.6-1.9 3.2C14.2 10.4 13.5 7 10.8 5c0 3-1 4.6-2.6 6.3C6.9 12.6 5.5 14 5.5 16c0 3.3 2.5 6 6.5 6z"/>'),  # flame
    "&#128337;": _svg('<circle cx="12" cy="12" r="9"/><path d="M12 7v5.5l4 2.3"/>'),  # clock
    "&#128680;": _svg('<path d="M12 2.5c-1 0-1.8.8-1.8 1.8v.7C7.2 5.7 5 8.3 5 11.5V16l-1.5 2.5h17L19 16v-4.5c0-3.2-2.2-5.8-5.2-6.5v-.7c0-1-.8-1.8-1.8-1.8z"/><path d="M9 19.5a3 3 0 0 0 6 0"/>'),  # emergency bell/alert
    "&#128737;&#65039;": _svg('<path d="M12 3l7 3v5.5c0 4.6-3 7.9-7 9.5-4-1.6-7-4.9-7-9.5V6z"/><path d="M9 12l2 2 4-4.5"/>'),  # shield
    "&#9888;&#65039;": _svg('<path d="M12 4.5L21.5 20h-19z"/><line x1="12" y1="10" x2="12" y2="14.5"/><line x1="12" y1="17" x2="12" y2="17.2"/>'),  # warning
    "&#9776;": _svg('<line x1="3.5" y1="7" x2="20.5" y2="7"/><line x1="3.5" y1="12" x2="20.5" y2="12"/><line x1="3.5" y1="17" x2="20.5" y2="17"/>'),  # menu
    "&#9992;&#65039;": _svg('<path d="M21.5 3.5L11 13.5"/><path d="M21.5 3.5l-6.5 18-4-8-8-4z"/>'),  # send
    "&#128266;": _svg('<path d="M4 10v4h3.5L12 17.5v-11L7.5 10z"/><path d="M16 9c1 1 1 5 0 6M18.3 6.7c2.3 2.3 2.3 8.3 0 10.6"/>'),  # speaker/acoustic
    "&#128295;": _svg('<path d="M14.7 6.3a4 4 0 0 1-5.4 5.3L4 17l3 3 5.4-5.3a4 4 0 0 1 5.3-5.4l-2.5 2.5-2-.6-.6-2z"/>'),  # wrench
    "&#128736;&#65039;": _svg('<path d="M14.7 6.3a4 4 0 0 1-5.4 5.3L4 17l3 3 5.4-5.3a4 4 0 0 1 5.3-5.4l-2.5 2.5-2-.6-.6-2z"/><line x1="17" y1="4" x2="20" y2="7"/>'),  # wrench-alt (repair)
    "&#128703;": _svg('<rect x="8" y="3" width="8" height="4.5" rx="0.8"/><path d="M8 7.5v2.2"/><path d="M16 7.5v2.2"/><ellipse cx="12" cy="15.5" rx="7" ry="5.2"/><ellipse cx="12" cy="15.5" rx="3.4" ry="2.6"/>'),  # toilet (tank + bowl)
    "&#127959;&#65039;": _svg('<path d="M4 11l8-6 8 6"/><path d="M6 10v9.5h12V10"/><line x1="10" y1="19.5" x2="10" y2="14.5"/><line x1="14" y1="19.5" x2="14" y2="14.5"/>'),  # house/slab
    "&#9993;&#65039;": _svg('<rect x="3.5" y="5.5" width="17" height="13" rx="2"/><path d="M4 6.5l8 6.5 8-6.5"/>'),  # envelope
    "&#9993;": _svg('<rect x="3.5" y="5.5" width="17" height="13" rx="2"/><path d="M4 6.5l8 6.5 8-6.5"/>'),
    "&#128701;": _svg('<rect x="8" y="3" width="8" height="4.5" rx="0.8"/><path d="M8 7.5v2.2"/><path d="M16 7.5v2.2"/><ellipse cx="12" cy="15.5" rx="7" ry="5.2"/><ellipse cx="12" cy="15.5" rx="3.4" ry="2.6"/>'),  # toilet (correct codepoint)
    "&#9742;": _svg('<path d="M5 4.5c0-.6.4-1 1-1h2.6c.5 0 .9.3 1 .8l.8 3.3c.1.4 0 .9-.3 1.2L8.7 10c1 2.4 3 4.3 5.3 5.3l1.2-1.4c.3-.3.7-.4 1.2-.3l3.3.8c.5.1.8.5.8 1V18.5c0 .6-.4 1-1 1C10.5 19.5 4.5 13.5 4.5 6z"/>'),  # phone (old-style glyph)
}

def apply_icons(html):
    for old, new in ICONS.items():
        html = html.replace(old, new)
    return html
