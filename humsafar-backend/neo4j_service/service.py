import json
import os
import sqlite3
from datetime import datetime, timedelta
from typing import Optional

from dotenv import load_dotenv

from schemas.models import (
    DocumentRequirement,
    OfficialSource,
    Procedure,
    ProcedureStatus,
    Step,
    LLMProvider,
    SourceType,
)

load_dotenv()

DB_PATH = os.getenv(
    "SQLITE_DB_PATH",
    os.path.join(os.path.dirname(__file__), "humsafar.db")
)

FRESHNESS_DAYS = int(os.getenv("FRESHNESS_DAYS", "30"))


def get_connection():
    connection = sqlite3.connect(DB_PATH)
    connection.row_factory = sqlite3.Row
    return connection


def init_db():
    connection = get_connection()

    connection.execute(
        """
        CREATE TABLE IF NOT EXISTS procedures (
            service TEXT NOT NULL,
            jurisdiction TEXT NOT NULL,
            data TEXT NOT NULL,
            verified_at TEXT,
            status TEXT,
            PRIMARY KEY (service, jurisdiction)
        )
        """
    )

    connection.commit()
    connection.close()


def is_connected() -> bool:
    try:
        init_db()
        connection = get_connection()
        connection.execute("SELECT 1")
        connection.close()
        return True
    except Exception:
        return False


def save_procedure(procedure: Procedure) -> None:
    init_db()

    verified_at = (
        procedure.verified_at.isoformat()
        if procedure.verified_at
        else None
    )

    data = procedure.model_dump(mode="json")

    connection = get_connection()

    connection.execute(
        """
        INSERT INTO procedures (
            service,
            jurisdiction,
            data,
            verified_at,
            status
        )
        VALUES (?, ?, ?, ?, ?)

        ON CONFLICT(service, jurisdiction)
        DO UPDATE SET
            data = excluded.data,
            verified_at = excluded.verified_at,
            status = excluded.status
        """,
        (
            procedure.service,
            procedure.jurisdiction,
            json.dumps(data),
            verified_at,
            procedure.status
        )
    )

    connection.commit()
    connection.close()


def get_fresh_procedure(
    service: str,
    jurisdiction: str
) -> Optional[Procedure]:

    init_db()

    connection = get_connection()

    row = connection.execute(
        """
        SELECT data, verified_at, status
        FROM procedures
        WHERE service = ?
          AND jurisdiction = ?
        """,
        (service, jurisdiction)
    ).fetchone()

    connection.close()

    if not row:
        return None

    if row["status"] != ProcedureStatus.VERIFIED.value:
        return None

    if not row["verified_at"]:
        return None

    try:
        verified_at = datetime.fromisoformat(
            row["verified_at"]
        )
    except ValueError:
        return None

    if datetime.now() - verified_at > timedelta(
        days=FRESHNESS_DAYS
    ):
        return None

    return Procedure.model_validate(
        json.loads(row["data"])
    )


def get_stale_procedure(
    service: str,
    jurisdiction: str
) -> Optional[Procedure]:

    init_db()

    connection = get_connection()

    row = connection.execute(
        """
        SELECT data
        FROM procedures
        WHERE service = ?
          AND jurisdiction = ?
        """,
        (service, jurisdiction)
    ).fetchone()

    connection.close()

    if not row:
        return None

    return Procedure.model_validate(
        json.loads(row["data"])
    )


init_db()