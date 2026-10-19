from pathlib import Path
from html import escape

OUT = Path(__file__).resolve().parents[1] / 'assets'
OUT.mkdir(exist_ok=True)
BG, FG, MUTED, GREEN = '#101713', '#f2f4eb', '#b7c4b8', '#c7f284'

def text(x,y,s,size=20,color=FG,weight=400,extra=''):
    return f'<text x="{x}" y="{y}" font-family="DejaVu Sans,Arial,sans-serif" font-size="{size}" font-weight="{weight}" fill="{color}" {extra}>{escape(s)}</text>'

def svg(title,w,h,body):
    return f'''<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" viewBox="0 0 {w} {h}" role="img" aria-labelledby="title"><title id="title">{escape(title)}</title><defs><pattern id="grid" width="36" height="36" patternUnits="userSpaceOnUse"><path d="M36 0H0V36" fill="none" stroke="#c7f284" stroke-opacity=".055"/></pattern></defs><rect width="{w}" height="{h}" rx="20" fill="{BG}"/><rect x="1" y="1" width="{w-2}" height="{h-2}" rx="19" fill="url(#grid)" stroke="#344139"/>{body}</svg>'''

for lang in ['es','en']:
    body = '<rect x="42" y="42" width="48" height="5" rx="2" fill="#c7f284"/>'
    body += text(105,51,'SOFTWARE DEVELOPER / ARGENTINA',17,MUTED,500, 'letter-spacing="2"')
    body += text(40,145,'Facundo',76,FG,700,'letter-spacing="-3"')
    body += text(43,190,'SkuuIll / Full Stack & Multiplatform',23,GREEN,500)
    lines = ['De la interfaz al sistema.', 'Software para distintos entornos.'] if lang=='es' else ['From interface to system.', 'Software across platforms.']
    for i,line in enumerate(lines): body += text(44,252+34*i,line,25,FG)
    body += '<path d="M44 327H1156" stroke="#344139"/>'
    body += text(44,373,'WEB   /   ANDROID   /   DESKTOP   /   LINUX   /   AUTOMATION',21,GREEN,500)
    # A restrained geometric device composition, not a product screenshot.
    body += '<g fill="none" stroke="#647a66" stroke-width="2"><rect x="790" y="93" width="315" height="165" rx="12"/><path d="M790 122H1105M912 258V280H987V258M873 282H1024"/><rect x="1047" y="146" width="81" height="147" rx="13" fill="#15211a"/><path d="M1075 157H1101"/></g>'
    body += text(816,163,'{ build }',23,GREEN,500)
    for y,w in [(187,150),(205,186),(223,106)]:body+=f'<rect x="817" y="{y}" width="{w}" height="5" rx="2" fill="#4d6352"/>'
    body += '<rect x="1060" y="178" width="55" height="53" rx="6" fill="#c7f284"/><path d="M1074 202L1085 213L1102 191" fill="none" stroke="#203322" stroke-width="4"/>'
    (OUT/f'profile-cover-{lang}.svg').write_text(svg('Facundo / SkuuIll — Software development',1200,410,body))

projects=[('tooling','01 / DEVELOPMENT TOOLS','Repo Setup Kit','PYTHON / SHELL / POWERSHELL'),('map','02 / INTERACTIVE WEB','PUBG Tactical Map','JAVASCRIPT / LEAFLET / PWA'),('web','03 / CONTENT APPLICATION','Informatorio Blog','PYTHON / DJANGO / GEMINI')]
for key,kicker,title,stack in projects:
    body=text(38,43,kicker,16,GREEN,500,'letter-spacing="2"')+text(36,106,title,40,FG,700)+text(39,154,stack,17,MUTED)
    if key=='tooling':
        body+='<rect x="785" y="30" width="360" height="130" rx="10" fill="#17231b" stroke="#49634d"/><path d="M785 56H1145" stroke="#49634d"/>'
        body+=text(805,88,'> repo-setup . --full',20,GREEN)+text(805,122,'Windows + Linux',18,MUTED)
    elif key=='map':
        body+='<g fill="none" stroke="#49634d"><path d="M780 40L890 65L1010 30L1140 60V150L1020 130L890 165L780 135Z"/><path d="M890 65V165M1010 30L1020 130"/></g><path d="M817 115L948 69L1090 106" fill="none" stroke="#c7f284" stroke-width="3" stroke-dasharray="6 6"/>'
        for x,y in [(817,115),(948,69),(1090,106)]:body+=f'<circle cx="{x}" cy="{y}" r="6" fill="#c7f284"/>'
    else:
        body+='<rect x="785" y="30" width="360" height="130" rx="10" fill="#17231b" stroke="#49634d"/><path d="M785 56H1145M872 56V160" stroke="#49634d"/><rect x="888" y="72" width="104" height="70" rx="5" fill="#314c37"/>'
        for y,w in [(76,119),(96,98),(116,112),(136,75)]:body+=f'<rect x="1007" y="{y}" width="{w}" height="5" rx="2" fill="#b7c4b8"/>'
    (OUT/f'project-{key}.svg').write_text(svg(title+' — project identity',1200,190,body))
