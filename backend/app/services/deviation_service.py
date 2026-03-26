from app.models.lab_result import LabResult


def calculate(result: LabResult) -> None:
    """Setzt is_high, is_low, is_out_of_range direkt auf dem Objekt."""
    result.is_high = False
    result.is_low = False
    result.is_out_of_range = False

    if result.value_numeric is None:
        return

    if result.ref_min is not None and result.value_numeric < result.ref_min:
        result.is_low = True
        result.is_out_of_range = True
    elif result.ref_max is not None and result.value_numeric > result.ref_max:
        result.is_high = True
        result.is_out_of_range = True
