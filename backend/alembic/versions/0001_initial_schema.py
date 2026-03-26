"""initial schema

Revision ID: 0001
Revises:
Create Date: 2026-03-26

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "0001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "import_batches",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("folder_path", sa.String(), nullable=True),
        sa.Column("started_at", sa.DateTime(), nullable=True),
        sa.Column("finished_at", sa.DateTime(), nullable=True),
        sa.Column("total_count", sa.Integer(), nullable=True),
        sa.Column("processed_count", sa.Integer(), nullable=True),
        sa.Column("failed_count", sa.Integer(), nullable=True),
        sa.Column("status", sa.String(), nullable=True),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_table(
        "patients",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("first_name", sa.String(), nullable=True),
        sa.Column("last_name", sa.String(), nullable=True),
        sa.Column("birth_date", sa.Date(), nullable=True),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_table(
        "parameter_mappings",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("alias", sa.String(), nullable=True),
        sa.Column("canonical_name", sa.String(), nullable=True),
        sa.Column("category", sa.String(), nullable=True),
        sa.Column("default_unit", sa.String(), nullable=True),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("alias"),
    )
    op.create_index("ix_parameter_mappings_alias", "parameter_mappings", ["alias"])

    op.create_table(
        "labs",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("batch_id", sa.Integer(), nullable=True),
        sa.Column("patient_id", sa.Integer(), nullable=True),
        sa.Column("external_lab_name", sa.String(), nullable=True),
        sa.Column("sample_date", sa.Date(), nullable=True),
        sa.Column("upload_filename", sa.String(), nullable=True),
        sa.Column("source_pdf_path", sa.String(), nullable=True),
        sa.Column("processing_status", sa.String(), nullable=True),
        sa.Column("approved_at", sa.DateTime(), nullable=True),
        sa.Column("approved_by", sa.String(), nullable=True),
        sa.Column("upload_timestamp", sa.DateTime(), nullable=True),
        sa.Column("error_message", sa.String(), nullable=True),
        sa.ForeignKeyConstraint(["batch_id"], ["import_batches.id"]),
        sa.ForeignKeyConstraint(["patient_id"], ["patients.id"]),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_table(
        "lab_results",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("lab_id", sa.Integer(), nullable=True),
        sa.Column("canonical_name", sa.String(), nullable=True),
        sa.Column("original_name", sa.String(), nullable=True),
        sa.Column("value_numeric", sa.Float(), nullable=True),
        sa.Column("unit", sa.String(), nullable=True),
        sa.Column("ref_min", sa.Float(), nullable=True),
        sa.Column("ref_max", sa.Float(), nullable=True),
        sa.Column("ref_text", sa.String(), nullable=True),
        sa.Column("is_high", sa.Boolean(), nullable=True),
        sa.Column("is_low", sa.Boolean(), nullable=True),
        sa.Column("is_out_of_range", sa.Boolean(), nullable=True),
        sa.Column("confidence", sa.String(), nullable=True),
        sa.Column("is_corrected", sa.Boolean(), nullable=True),
        sa.Column("corrected_by", sa.String(), nullable=True),
        sa.Column("corrected_at", sa.DateTime(), nullable=True),
        sa.Column("display_order", sa.Integer(), nullable=True),
        sa.Column("category", sa.String(), nullable=True),
        sa.ForeignKeyConstraint(["lab_id"], ["labs.id"]),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_table(
        "extraction_runs",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("lab_id", sa.Integer(), nullable=True),
        sa.Column("provider", sa.String(), nullable=True),
        sa.Column("model_name", sa.String(), nullable=True),
        sa.Column("prompt_version", sa.String(), nullable=True),
        sa.Column("raw_response_json", sa.Text(), nullable=True),
        sa.Column("confidence_score", sa.Float(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(["lab_id"], ["labs.id"]),
        sa.PrimaryKeyConstraint("id"),
    )


def downgrade() -> None:
    op.drop_table("extraction_runs")
    op.drop_table("lab_results")
    op.drop_table("labs")
    op.drop_index("ix_parameter_mappings_alias", "parameter_mappings")
    op.drop_table("parameter_mappings")
    op.drop_table("patients")
    op.drop_table("import_batches")
