"""
Minetrack - Seed Script (SQLite version) - RDC Context
Populates the database with realistic mining demo data for DRC
"""
import asyncio
import uuid
import json
import random
from datetime import datetime, timedelta, timezone
from pathlib import Path
import aiosqlite
from auth_utils import hash_password

DB_PATH = Path(__file__).parent / "minetrack.db"

def new_id():
    return str(uuid.uuid4())

def now():
    return datetime.now(timezone.utc).isoformat()

async def seed_data():
    print("🌱 Seeding Minetrack SQLite database (RDC Context)...")

    async with aiosqlite.connect(DB_PATH) as db:
        # Clear all tables
        tables = ["users", "pegs", "work_progress", "drilling", "blasting",
                  "production", "equipment", "labor", "hse", "geology", "support", "financial"]
        for t in tables:
            await db.execute(f"DELETE FROM {t}")
        await db.commit()
        print("   ✅ Tables cleared")

        # Users
        users = [
            (new_id(), "daynriley@gmail.com", hash_password("Marie_tte637"), "Admin Système", "admin"),
            (new_id(), "superviseur@minetrack.com", hash_password("super123"), "Jean-Baptiste Ilunga", "supervisor"),
            (new_id(), "operateur@minetrack.com", hash_password("oper123"), "Moussa Kasongo", "operator"),
            (new_id(), "geologue@minetrack.com", hash_password("geo123"), "Dr. Amina Mukendi", "geologist"),
        ]
        await db.executemany(
            "INSERT INTO users (id, email, password, name, role, created_at) VALUES (?, ?, ?, ?, ?, ?)",
            [(u[0], u[1], u[2], u[3], u[4], now()) for u in users]
        )
        print("   ✅ Users seeded")

        zones = ["Kolwezi - Fosse Nord", "Kipushi - Zone Est", "Tenke - Sud", "Ruashi - Ouest"]
        statuses = ["active", "active", "active", "completed", "pending"]

        # Pegs
        pegs = []
        for i in range(1, 16):
            pegs.append((
                new_id(), f"PEG-{i:03d}", zones[i % len(zones)],
                json.dumps({"lat": -10.71 + i * 0.01, "lng": 25.47 + i * 0.01}), # Katanga coordinates approx
                statuses[i % len(statuses)],
                (datetime.now() - timedelta(days=i * 5)).strftime("%Y-%m-%d"),
                f"Peg dans {zones[i % len(zones)]}", now(), "daynriley@gmail.com"
            ))
        await db.executemany(
            "INSERT INTO pegs (id, peg_id, zone, coordinates, status, date_installed, notes, created_at, created_by) VALUES (?,?,?,?,?,?,?,?,?)",
            pegs
        )
        print("   ✅ Pegs seeded (15)")

        # Work Progress
        activities = ["Décapage", "Extraction", "Transport", "Concassage", "Analyse"]
        teams = ["Équipe Simba", "Équipe Chui", "Équipe Tembo", "Équipe Nyati"]
        wp = []
        for i in range(1, 13):
            wp.append((
                new_id(), f"PEG-{(i % 15) + 1:03d}", activities[i % len(activities)],
                teams[i % len(teams)], min(100.0, i * 9.0),
                "in_progress" if i % 3 != 0 else "completed",
                (datetime.now() - timedelta(days=i * 3)).strftime("%Y-%m-%d"),
                datetime.now().strftime("%Y-%m-%d") if i % 3 == 0 else None,
                f"Avancement activité {i}", now(), "daynriley@gmail.com"
            ))
        await db.executemany(
            "INSERT INTO work_progress (id, peg_id, activity, team, progress_percent, status, start_date, end_date, notes, created_at, created_by) VALUES (?,?,?,?,?,?,?,?,?,?,?)",
            wp
        )
        print("   ✅ Work Progress seeded")

        # Drilling
        rock_types = ["Dolomie", "Schiste argileux", "Grès", "Brèche", "Quartzite"]
        drills = []
        for i in range(1, 21):
            drills.append((
                new_id(), f"PEG-{(i % 15) + 1:03d}", f"DH-{i:04d}",
                round(50 + i * 3.5, 1), [76, 89, 102, 127][i % 4],
                rock_types[i % len(rock_types)],
                "completed" if i < 15 else "in_progress",
                (datetime.now() - timedelta(days=i * 2)).strftime("%Y-%m-%d"),
                ["Kofi Mutombo", "Ibrahim Kabila", "Yao Tshisekedi"][i % 3],
                f"Forage trou {i}", now(), "daynriley@gmail.com"
            ))
        await db.executemany(
            "INSERT INTO drilling (id, peg_id, hole_id, depth_m, diameter_mm, rock_type, status, date, operator, notes, created_at, created_by) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)",
            drills
        )
        print("   ✅ Drilling seeded (20)")

        # Blasting
        blasts = []
        for i in range(1, 9):
            blasts.append((
                new_id(), f"PEG-{(i % 10) + 1:03d}", f"BLAST-{i:03d}",
                round(500 + i * 125.5, 1), 20 + i * 5,
                (datetime.now() - timedelta(days=i * 4)).strftime("%Y-%m-%d"),
                "completed" if i < 6 else "planned",
                "Succès - fragmentation optimale" if i < 6 else None,
                f"Tir de mine #{i}", now(), "daynriley@gmail.com"
            ))
        await db.executemany(
            "INSERT INTO blasting (id, peg_id, blast_id, explosives_kg, holes_count, date, status, result, notes, created_at, created_by) VALUES (?,?,?,?,?,?,?,?,?,?,?)",
            blasts
        )
        print("   ✅ Blasting seeded")

        # Production
        materials = ["Minerai Cuivre", "Minerai Cobalt", "Coltan", "Cassitérite", "Or (Au)", "Stérile"]
        prod = []
        for i in range(1, 31):
            day = (datetime.now() - timedelta(days=i)).strftime("%Y-%m-%d")
            prod.append((
                new_id(), f"PEG-{(i % 15) + 1:03d}", day,
                materials[i % len(materials)],
                round(800 + i * 45.3, 1), round(2100 + i * 115.7, 1),
                f"EQ-{(i % 5) + 1:03d}", "day" if i % 2 == 0 else "night",
                f"Production journée {i}", now(), "daynriley@gmail.com"
            ))
        await db.executemany(
            "INSERT INTO production (id, peg_id, date, material_type, volume_m3, tonnage, equipment_id, shift, notes, created_at, created_by) VALUES (?,?,?,?,?,?,?,?,?,?,?)",
            prod
        )
        print("   ✅ Production seeded (30 days)")

        # Equipment
        equipment = [
            ("EQ-001", "Pelle CAT 390F", "excavator", "operational", 1250.5),
            ("EQ-002", "Camion Komatsu HD785", "truck", "operational", 2100.0),
            ("EQ-003", "Foreuse Atlas Copco D65", "drill", "maintenance", 980.0),
            ("EQ-004", "Concasseur Metso LT120", "crusher", "operational", 560.3),
            ("EQ-005", "Chargeur Liebherr L586", "loader", "operational", 1890.7),
            ("EQ-006", "Bulldozer CAT D8T", "excavator", "breakdown", 3200.1),
            ("EQ-007", "Camion Volvo FMX 460", "truck", "standby", 450.0),
            ("EQ-008", "Foreuse Sandvik DP1500i", "drill", "operational", 720.5),
        ]
        equip_rows = [
            (new_id(), eq[0], eq[1], eq[2], eq[3], eq[4],
             (datetime.now() + timedelta(days=30)).strftime("%Y-%m-%d"),
             zones[i % len(zones)], None, now(), "daynriley@gmail.com")
            for i, eq in enumerate(equipment)
        ]
        await db.executemany(
            "INSERT INTO equipment (id, equipment_id, name, type, status, hours_used, next_service_date, location, notes, created_at, created_by) VALUES (?,?,?,?,?,?,?,?,?,?,?)",
            equip_rows
        )
        print("   ✅ Equipment seeded (8)")

        # Labor (with ARSP / National status)
        roles = ["Conducteur d'engin", "Foreur", "Technicien", "Ingénieur", "Géologue", "Agent de sécurité"]
        labor = []
        for i in range(1, 20):
            # 80% national, 20% expat
            origin = "national" if random.random() > 0.2 else "expat"
            contract = "direct" if random.random() > 0.3 else "contractor"
            labor.append((
                new_id(), f"EMP-{i:04d}", f"Employé {i}",
                roles[i % len(roles)], teams[i % len(teams)],
                "day" if i % 2 == 0 else "night",
                round(7.5 + (i % 3) * 0.5, 1),
                datetime.now().strftime("%Y-%m-%d"),
                f"PEG-{(i % 10) + 1:03d}", origin, contract, None, now(), "daynriley@gmail.com"
            ))
        await db.executemany(
            "INSERT INTO labor (id, employee_id, name, role, team, shift, hours_worked, date, peg_id, origin_status, contract_type, notes, created_at, created_by) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
            labor
        )
        print("   ✅ Labor seeded (19)")

        # HSE (with DPEM / Environment)
        incident_types = ["near_miss", "accident", "violation", "environmental", "observation"]
        severities = ["low", "medium", "high", "critical"]
        hse = []
        for i in range(1, 13):
            hse.append((
                new_id(), f"HSE-{i:04d}",
                incident_types[i % len(incident_types)],
                severities[i % len(severities)],
                f"Incident DPEM/HSE #{i} - Fuite ou déversement mineur" if i % 4 == 3 else f"Incident HSE #{i}",
                zones[i % len(zones)],
                (datetime.now() - timedelta(days=i * 3)).strftime("%Y-%m-%d"),
                f"Agent {i}", "closed" if i < 7 else "open",
                "Action corrective appliquée" if i < 7 else None,
                now(), "daynriley@gmail.com"
            ))
        await db.executemany(
            "INSERT INTO hse (id, incident_id, type, severity, description, location, date, reported_by, status, corrective_action, created_at, created_by) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)",
            hse
        )
        print("   ✅ HSE seeded (12)")

        # Geology (with Cu/Co)
        rock_types_geo = ["Brèche", "Dolomie", "Schiste argileux", "Quartzite", "Gneiss"]
        geo = []
        for i in range(1, 25):
            geo.append((
                new_id(), f"GEO-{i:04d}", f"PEG-{(i % 15) + 1:03d}",
                round(i * 5.0, 1), round(i * 5.0 + 5.0, 1),
                rock_types_geo[i % len(rock_types_geo)],
                round(0.5 + (i % 7) * 0.8, 2), # Au
                round(2.5 + (i % 5) * 1.5, 2), # Cu
                round(0.4 + (i % 3) * 0.3, 2), # Co
                round(0.0 + (i % 4) * 0.1, 2) if i % 2 == 0 else None, # Coltan
                (datetime.now() - timedelta(days=i * 2)).strftime("%Y-%m-%d"),
                "Dr. Amina Mukendi", f"Échantillon RDC #{i}",
                now(), "daynriley@gmail.com"
            ))
        await db.executemany(
            "INSERT INTO geology (id, sample_id, peg_id, depth_from, depth_to, rock_type, grade_au_gt, grade_cu_pct, grade_co_pct, grade_coltan_gt, date, geologist, notes, created_at, created_by) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
            geo
        )
        print("   ✅ Geology seeded (24)")

        # Support
        categories = ["mechanical", "electrical", "logistics", "IT", "other"]
        priorities = ["low", "medium", "high", "urgent"]
        support = []
        for i in range(1, 11):
            support.append((
                new_id(), f"TKT-{i:04d}",
                categories[i % len(categories)],
                priorities[i % len(priorities)],
                f"Demande de support #{i}",
                f"Employé {i}",
                "Équipe technique" if i % 2 == 0 else None,
                "resolved" if i < 6 else "open",
                (datetime.now() - timedelta(days=i * 2)).strftime("%Y-%m-%d"),
                datetime.now().strftime("%Y-%m-%d") if i < 6 else None,
                now(), "daynriley@gmail.com"
            ))
        await db.executemany(
            "INSERT INTO support (id, ticket_id, category, priority, description, requested_by, assigned_to, status, date_created, date_resolved, created_at, created_by) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)",
            support
        )
        print("   ✅ Support seeded")

        # Financial (USD / CDF)
        fin_cats = ["fuel", "maintenance", "labor", "explosives", "equipment", "redevance", "other"]
        financial = []
        for i in range(1, 21):
            is_cdf = (i % 3 == 0)
            amount = round(1500000 + i * 250000, 0) if is_cdf else round(5000 + i * 1250.75, 2)
            amount_usd = round(amount / 2850, 2) if is_cdf else amount
            
            financial.append((
                new_id(), f"FIN-{i:04d}",
                (datetime.now() - timedelta(days=i * 2)).strftime("%Y-%m-%d"),
                fin_cats[i % len(fin_cats)],
                "CDF" if is_cdf else "USD",
                f"Dépense ou Taxe #{i}",
                amount,
                amount_usd,
                f"PEG-{(i % 10) + 1:03d}",
                "Jean-Baptiste Ilunga", f"Enregistrement #{i}",
                now(), "daynriley@gmail.com"
            ))
        await db.executemany(
            "INSERT INTO financial (id, record_id, date, category, currency, description, amount, amount_usd, peg_id, approved_by, notes, created_at, created_by) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)",
            financial
        )
        print("   ✅ Financial seeded (20)")

        await db.commit()

    print("\n🎉 Seeding terminé avec succès !")
    print("   Login: daynriley@gmail.com / Marie_tte637")

if __name__ == "__main__":
    asyncio.run(seed_data())
