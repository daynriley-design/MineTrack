from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List
from datetime import datetime
import uuid


def new_id() -> str:
    return str(uuid.uuid4())


# ---------- Auth ----------
class UserCreate(BaseModel):
    email: str
    password: str
    name: str
    role: str = "operator"  # admin | supervisor | operator | geologist


class UserLogin(BaseModel):
    email: str
    password: str


# ---------- Peg ----------
class PegCreate(BaseModel):
    peg_id: str
    zone: str
    coordinates: Optional[dict] = None
    status: str = "active"  # active | completed | pending
    date_installed: Optional[str] = None
    notes: Optional[str] = None


class PegUpdate(BaseModel):
    zone: Optional[str] = None
    status: Optional[str] = None
    notes: Optional[str] = None


# ---------- Work Progress ----------
class WorkProgressCreate(BaseModel):
    peg_id: str
    activity: str
    team: str
    progress_percent: float = 0.0
    status: str = "in_progress"  # planned | in_progress | completed | blocked
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    notes: Optional[str] = None


# ---------- Drilling ----------
class DrillingCreate(BaseModel):
    peg_id: str
    hole_id: str
    depth_m: float
    diameter_mm: float
    rock_type: Optional[str] = None
    status: str = "planned"
    date: Optional[str] = None
    operator: Optional[str] = None
    notes: Optional[str] = None


# ---------- Blasting ----------
class BlastingCreate(BaseModel):
    peg_id: str
    blast_id: str
    explosives_kg: float
    holes_count: int
    date: Optional[str] = None
    status: str = "planned"
    result: Optional[str] = None
    advance_after_blast_m: Optional[float] = None
    reentry_minutes: Optional[int] = None
    notes: Optional[str] = None


# ---------- Production ----------
class ProductionCreate(BaseModel):
    peg_id: str
    date: str
    material_type: str
    volume_m3: float
    tonnage: float
    equipment_id: Optional[str] = None
    shift: str = "day"  # day | night
    notes: Optional[str] = None


# ---------- Equipment ----------
class EquipmentCreate(BaseModel):
    equipment_id: str
    name: str
    type: str  # excavator | truck | drill | crusher | loader
    status: str = "operational"  # operational | maintenance | breakdown | standby
    hours_used: float = 0.0
    next_service_date: Optional[str] = None
    location: Optional[str] = None
    notes: Optional[str] = None


# ---------- Labor / Teams ----------
class LaborCreate(BaseModel):
    employee_id: str
    name: str
    role: str
    team: str
    shift: str = "day"
    hours_worked: float = 0.0
    date: Optional[str] = None
    peg_id: Optional[str] = None
    origin_status: str = "national"  # national | expat
    contract_type: str = "direct"  # direct | contractor
    notes: Optional[str] = None


# ---------- HSE / Safety ----------
class HSECreate(BaseModel):
    incident_id: str
    type: str  # near_miss | accident | violation | observation
    severity: str = "low"  # low | medium | high | critical
    description: str
    location: str
    date: str
    reported_by: Optional[str] = None
    status: str = "open"  # open | investigating | closed
    corrective_action: Optional[str] = None


# ---------- Geology ----------
class GeologyCreate(BaseModel):
    sample_id: str
    peg_id: Optional[str] = None
    depth_from: float
    depth_to: float
    rock_type: str
    grade_au_gt: Optional[float] = None  # gold grade g/t
    grade_cu_pct: Optional[float] = None  # copper %
    grade_co_pct: Optional[float] = None  # cobalt %
    grade_coltan_gt: Optional[float] = None # coltan g/t
    date: Optional[str] = None
    geologist: Optional[str] = None
    notes: Optional[str] = None


# ---------- Support ----------
class SupportCreate(BaseModel):
    ticket_id: str
    category: str  # mechanical | electrical | logistics | IT | other
    priority: str = "medium"
    description: str
    requested_by: str
    assigned_to: Optional[str] = None
    status: str = "open"
    date_created: Optional[str] = None
    date_resolved: Optional[str] = None


# ---------- Financial ----------
class FinancialCreate(BaseModel):
    record_id: str
    date: str
    category: str  # fuel | maintenance | labor | explosives | equipment | redevance | other
    currency: str = "USD" # USD | CDF
    description: str
    amount: float
    amount_usd: Optional[float] = None # Converted value
    peg_id: Optional[str] = None
    approved_by: Optional[str] = None
    notes: Optional[str] = None

# ---------- New 3-Apps Models ----------
class PegAdvanceCreate(BaseModel):
    peg_id: str
    shift: str
    date: str
    drilled_meters: float = 0.0
    blasted_holes: int = 0
    mucked_tonnage: float = 0.0
    notes: Optional[str] = None

class IncidentCreate(BaseModel):
    title: str
    description: str
    severity: str = "low" # low | medium | high | critical
    location: str
    date: str
    reported_by: Optional[str] = None

class HSEChecklistCreate(BaseModel):
    peg_id: str
    shift: str
    date: str
    face_safe: bool = False
    ventilation_ok: bool = False
    gas_checked: bool = False
    water_sprayed: bool = False
    supports_ok: bool = False
    notes: Optional[str] = None

class EquipmentPanneCreate(BaseModel):
    equipment_id: str
    issue_type: str
    description: str
    reported_date: str
    reported_by: Optional[str] = None
    status: str = "open"
    photo: Optional[str] = None

class MiniReportCreate(BaseModel):
    shift: str
    date: str
    peg_id: str
    weather_conditions: str = "normal"
    safety_summary: str
    production_summary: str
    issues_encountered: str
    submitted_by: Optional[str] = None


class PtoCreate(BaseModel):
    employee_id: str
    employee_name: str
    date: str
    leave_type: str = "conge"
    days: float = 1
    status: str = "pending"
    notes: Optional[str] = None


class FaceExaminationCreate(BaseModel):
    peg_id: str
    date: str
    examiner: Optional[str] = None
    ground_condition: str = "safe"
    hazards_observed: Optional[str] = None
    ventilation_ok: int = 1
    gas_readings: Optional[str] = None
    action_required: Optional[str] = None
    status: str = "cleared"
    photo: Optional[str] = None


class GroundSupportCreate(BaseModel):
    peg_id: str
    support_type: str
    quantity: float
    date_installed: str
    state: str = "good"
    shotcrete_m3: Optional[float] = None
    concrete_m3: Optional[float] = None
    notes: Optional[str] = None

