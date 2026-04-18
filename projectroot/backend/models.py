from pydantic import BaseModel
from typing import List, Optional


class LicenseVerifyRequest(BaseModel):
    license_no: str
    vid: str            # VitalID of the patient being accessed


class SymptomAnalysisRequest(BaseModel):
    symptoms: List[str]
    patient_age: Optional[int] = None
    duration: Optional[str] = None
