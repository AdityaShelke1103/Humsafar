import sqlite3
import json

conn = sqlite3.connect('neo4j_service/humsafar.db')
row = conn.execute(
    "SELECT data FROM procedures WHERE service=? AND jurisdiction=?",
    ("domicile_certificate", "Maharashtra")
).fetchone()

data = json.loads(row[0])
step2 = [s for s in data['steps'] if s['id'] == 'step_2'][0]

print('step_2 source_ids:', step2['source_ids'])
print('procedure sources:', [s['id'] for s in data['sources']])

conn.close()