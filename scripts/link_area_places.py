"""Give every JSON-LD areaServed place one @id, name, type and Wikipedia sameAs.

Run from the repo root after adding a page whose areaServed names a city:
    python3 scripts/link_area_places.py
Idempotent. Guarded by growth-engine/tests/test_place_entities.py.
Wikipedia article URLs verified by search 2026-11-17; Dove Canyon redirects to
Rancho Santa Margarita on Wikipedia, so it has no sameAs of its own.
(Added 2026-11-17 by the entity-schema shift.)
"""
import re,glob,json,sys
B="https://straightflushplumbingoc.com/service-areas.html#"
W="https://en.wikipedia.org/wiki/"
inc={"Laguna Niguel":"Laguna_Niguel","Dana Point":"Dana_Point","San Clemente":"San_Clemente","San Juan Capistrano":"San_Juan_Capistrano","Mission Viejo":"Mission_Viejo","Laguna Hills":"Laguna_Hills","Laguna Beach":"Laguna_Beach","Laguna Woods":"Laguna_Woods","Aliso Viejo":"Aliso_Viejo","Rancho Santa Margarita":"Rancho_Santa_Margarita","Lake Forest":"Lake_Forest","Irvine":"Irvine","Newport Beach":"Newport_Beach","Costa Mesa":"Costa_Mesa","Huntington Beach":"Huntington_Beach","Tustin":"Tustin","Orange":"Orange"}
uninc={"Ladera Ranch":"Ladera_Ranch","Coto de Caza":"Coto_de_Caza","Foothill Ranch":"Foothill_Ranch","Dove Canyon":None}
OC=B+"orange-county"
def slug(n): return n.lower().replace(' ','-')
def node(name):
    base=name[:-4]
    if base=="Orange County":
        return {"@type":"AdministrativeArea","@id":OC,"name":"Orange County, CA","sameAs":W+"Orange_County,_California"}
    t="City" if base in inc else "Place"
    w=inc.get(base) or uninc.get(base)
    d={"@type":t,"@id":B+slug(base),"name":name}
    if w: d["sameAs"]=W+w+",_California"
    d["containedInPlace"]={"@id":B+"rancho-santa-margarita"} if base=="Dove Canyon" else {"@id":OC}
    return d
def norm(name):
    if name in("Orange County, California","Orange County, CA"): return "Orange County, CA"
    assert name.endswith(", CA") and name[:-4] in {**inc,**uninc}, name
    return name
def compact(d): return json.dumps(d,separators=(',',':'),ensure_ascii=False)
def pretty(d,ind):
    lines=json.dumps(d,indent=2,ensure_ascii=False).split('\n')
    return lines[0]+''.join('\n'+ind+l for l in lines[1:])
FULL_OC = compact(node("Orange County, CA"))
OC_REF = '"containedInPlace":' + compact({"@id": OC})


def link_file(h):
    def rp(m):
        ind = m.group(1)
        return f'{ind}"areaServed": ' + pretty(node(norm(m.group(3))), ind)
    # "areaServed": { "@type": "City", "name": "X, CA" }  (pretty-printed)
    h = re.sub(r'(?m)^([ \t]*)"areaServed": \{\s*"@type": "(City|Place|AdministrativeArea)",\s*"name": "([^"]+)"\s*\}', rp, h)
    # pretty-printed list items inside an areaServed array
    h = re.sub(r'(\n[ \t]*)\{\s*"@type": "(?:City|Place)",\s*"name": "([^"]+, CA)"\s*\}',
               lambda m: m.group(1) + pretty(node(norm(m.group(2))), m.group(1)[1:]), h)
    # "areaServed": "X, CA"  (bare string; ContactPoint "US" is left alone)
    h = re.sub(r'"areaServed": ?"([^"]+, C[A-Za-z]+)"', lambda m: '"areaServed": ' + compact(node(norm(m.group(1)))), h)
    # compact list items {"@type":"City","name":"X, CA"}
    h = re.sub(r'\{"@type":"(?:City|Place)","name":"([^"]+)"\}', lambda m: compact(node(norm(m.group(1)))), h)
    return h


if __name__ == "__main__":
    n = 0
    for f in sorted(glob.glob("**/*.html", recursive=True)):
        if f.startswith(("geo-lab", "ai-head", "briefs", "md/")):
            continue
        h = open(f, encoding="utf-8").read()
        if '"areaServed"' not in h:
            continue
        o = h
        h = link_file(h)
        # the two full service-area lists carry the full Orange County node once
        if f in ("index.html", "service-areas.html") and OC_REF in h and FULL_OC not in h:
            h = h.replace(OC_REF, '"containedInPlace":' + FULL_OC, 1)
        if h != o:
            open(f, "w", encoding="utf-8").write(h)
            n += 1
    print(n, "files changed")
