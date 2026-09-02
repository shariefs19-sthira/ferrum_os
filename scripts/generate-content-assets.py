"""Build the source-controlled, honest resource downloads for W2-348."""

from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "apps" / "web" / "public" / "assets"

DOCUMENTS = [
    ("templates/land-feasibility-one-pager.pdf", "Land feasibility one-page template", "Template", ["Use this page to separate verified site facts from assumptions before an investment or design decision.", "Site and access: record parcel reference, approach route, visible constraints, and the date of the visit.", "Ground conditions: note observations only; attach a qualified geotechnical report before relying on soil conclusions.", "Decision log: state the next decision, owner, evidence still required, and the date for review."]),
    ("templates/rate-comparison-worksheet.pdf", "Rate-comparison worksheet", "Template", ["A printable comparison grid for like-for-like vendor review. It does not calculate a market rate or recommend a supplier.", "List one measurable activity per row. Capture inclusions, exclusions, tax treatment, programme implications, and the source quote.", "Ask a commercial reviewer to reconcile scope before choosing a lowest figure."]),
    ("templates/daily-site-diary.pdf", "Daily site diary template", "Template", ["A daily factual record for weather, attendance, deliveries, instructions, and blockers.", "Record time, author, and source for every entry. This form is not a substitute for contractual notice requirements.", "Close the day with the next shift's constraints and any item requiring a written instruction."]),
    ("templates/project-handover-checklist.pdf", "Project handover checklist", "Template", ["A close-out checklist for teams transferring a completed work package to an owner or operator.", "Confirm approved as-built records, test certificates, warranties, snag ownership, and operations training against the contract.", "Do not mark an item complete solely because a file exists; record reviewer, date, and location of the accepted evidence."]),
    ("whitepapers/boq-drift-diagnostics.pdf", "BOQ drift diagnostics: a working protocol", "Working paper", ["This original working paper explains a review routine; it does not present client data or a validated benchmark.", "Compare the approved quantity basis, the executed record, and the valuation basis using the same item definitions and units.", "Classify a variance as scope, quantity, rate, timing, or evidence gap before escalating it.", "Keep a decision trail: source record, reviewer, interpretation, and the action that closes the variance."]),
    ("whitepapers/standards-as-procurement-filter.pdf", "Standards as a procurement filter", "Working paper", ["A practical framework for making relevant standards visible in procurement evaluation without treating compliance as a checkbox.", "Define the applicable standard and revision, the evidence expected from each bidder, and who is competent to review it.", "Keep price comparison separate from technical acceptability; a low quote without traceable evidence remains unresolved."]),
    ("whitepapers/is-1200-vs-cesmm4.pdf", "IS 1200 vs CESMM4: a comparison worksheet", "Working paper", ["A neutral comparison worksheet for measurement-basis discussions. Confirm the governing contract documents before use.", "For each work section, record the chosen measurement rule, inclusions, exclusions, drawing reference, and valuation consequence.", "This note does not interpret either standard or replace qualified contractual advice."]),
    ("whitepapers/monsoon-concreting-decision-tree.pdf", "Monsoon concreting decision tree", "Field guide", ["A planning prompt for site teams facing wet-weather pours. It is not a mix-design approval or a substitute for the engineer's instructions.", "Before a pour: check the approved method statement, weather observation, access, drainage, materials protection, and curing plan.", "During and after: document any deviation, hold point, instruction, and test record in the project quality system."]),
    ("whitepapers/thermal-envelope-cost-tradeoffs.pdf", "Thermal envelope design: trade-off prompts", "Working paper", ["A decision framework for comparing envelope options without asserting energy or cost performance for a specific project.", "Define climate inputs, target comfort criteria, material availability, buildability, maintenance, and the relevant model assumptions.", "Record capital, operating, and replacement assumptions separately so the team can test sensitivity transparently."]),
    ("whitepapers/carbon-accounting-for-builders.pdf", "Carbon accounting for builders: a working method", "Working paper", ["An evidence-first checklist for an embodied-carbon estimate. It does not contain emissions factors or certify a project result.", "Set the assessment boundary, capture quantities and units, cite the factor source and version, and preserve calculation assumptions.", "Label incomplete data and avoid comparisons until boundaries and sources are aligned."]),
    ("whitepapers/retrofit-payback-models.pdf", "Retrofit payback models: comparison prompts", "Working paper", ["A framework for testing retrofit options. It does not forecast savings, costs, or payback for any building.", "List the intervention, baseline evidence, capital cost basis, operating assumptions, service life, risk, and decision owner.", "Run sensitivity checks with project-specific evidence; do not treat a single payback number as a decision by itself."]),
    ("reports/india-construction-cost-benchmarks-2026.pdf", "India construction cost planning brief, 2026", "Planning brief", ["This is a blank, evidence-led cost-planning brief - not a city benchmark and not a database of market rates.", "For each project, record the cost basis, location, date, specification, quantity basis, inclusions, exclusions, and source authority.", "Every sample figure must remain INDICATIVE until the project team has independently verified it against current supplier or tender evidence."]),
    ("reports/standards-discipline-survey.pdf", "Standards discipline review brief", "Planning brief", ["This review brief contains no survey results and makes no claim about developer or contractor practice.", "Use it to map an organisation's stated standard requirements, evidence routes, review gates, exceptions, and accountable roles.", "If a survey is commissioned, document the sampling frame, questionnaire, response count, and limitations before publishing findings."]),
    ("reports/monsoon-impact-report.pdf", "Monsoon impact review brief", "Planning brief", ["This is a site-team review structure, not a multi-project panel study or schedule benchmark.", "Capture project-specific weather observations, notices, disruption records, mitigation decisions, and outcomes with their sources.", "Do not aggregate projects with incompatible scope, location, programme, or evidence standards."]),
    ("reports/procurement-cycle-times.pdf", "Procurement cycle-time review brief", "Planning brief", ["This is an internal process-mapping aid, not a benchmark of item categories or leading-team performance.", "Map each project gate from requisition to order, including owner, evidence requirement, return loop, and elapsed days.", "Review bottlenecks only after the definitions and timestamps are consistent across the process."]),
]


def header_footer(canvas, doc):
    canvas.saveState()
    canvas.setFont("Helvetica-Bold", 8)
    canvas.setFillColor(colors.HexColor("#8A651D"))
    canvas.drawCentredString(A4[0] / 2, A4[1] - 12 * mm, "INDICATIVE - ORIGINAL WORKING MATERIAL - VERIFY FOR YOUR PROJECT")
    canvas.setStrokeColor(colors.HexColor("#D7D1C4"))
    canvas.line(18 * mm, A4[1] - 15 * mm, A4[0] - 18 * mm, A4[1] - 15 * mm)
    canvas.setFont("Helvetica", 8)
    canvas.setFillColor(colors.HexColor("#605A52"))
    canvas.drawString(18 * mm, 11 * mm, "Ferrum OS resource library")
    canvas.drawRightString(A4[0] - 18 * mm, 11 * mm, f"Page {doc.page}")
    canvas.restoreState()


def make_document(relative_path, title, kind, points):
    path = OUTPUT / relative_path
    path.parent.mkdir(parents=True, exist_ok=True)
    doc = SimpleDocTemplate(str(path), pagesize=A4, rightMargin=18 * mm, leftMargin=18 * mm, topMargin=24 * mm, bottomMargin=20 * mm, title=title, author="Ferrum OS")
    styles = getSampleStyleSheet()
    title_style = ParagraphStyle("ResourceTitle", parent=styles["Title"], fontName="Helvetica-Bold", fontSize=24, leading=29, textColor=colors.HexColor("#1D2421"), spaceAfter=8)
    sub_style = ParagraphStyle("ResourceSub", parent=styles["Normal"], fontName="Helvetica-Bold", fontSize=10, leading=14, textColor=colors.HexColor("#8A651D"), alignment=TA_CENTER, spaceAfter=18)
    body = ParagraphStyle("ResourceBody", parent=styles["BodyText"], fontName="Helvetica", fontSize=10.5, leading=16, textColor=colors.HexColor("#302F2C"), spaceAfter=10)
    h2 = ParagraphStyle("ResourceH2", parent=styles["Heading2"], fontName="Helvetica-Bold", fontSize=14, leading=18, textColor=colors.HexColor("#1D2421"), spaceBefore=12, spaceAfter=7)
    small = ParagraphStyle("ResourceSmall", parent=styles["BodyText"], fontName="Helvetica", fontSize=8.5, leading=12, textColor=colors.HexColor("#605A52"), spaceAfter=8)
    story = [Paragraph(kind.upper(), sub_style), Paragraph(title, title_style), Paragraph("Status: INDICATIVE. This is original general working material. It contains no verified client data, market benchmark, survey result, design approval, or professional advice.", body), Spacer(1, 3 * mm), Paragraph("How to use this resource", h2)]
    story += [Paragraph(f"- {point}", body) for point in points]
    story += [Paragraph("Evidence record", h2), Table([["Project / package", "Evidence source", "Reviewer", "Date", "Status"], ["", "", "", "", ""], ["", "", "", "", ""], ["", "", "", "", ""]], colWidths=[40 * mm, 52 * mm, 28 * mm, 25 * mm, 25 * mm], rowHeights=[8 * mm] * 4, style=TableStyle([("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#EDE9DF")), ("TEXTCOLOR", (0, 0), (-1, 0), colors.HexColor("#1D2421")), ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"), ("FONTSIZE", (0, 0), (-1, -1), 8), ("GRID", (0, 0), (-1, -1), 0.4, colors.HexColor("#C8C1B4")), ("VALIGN", (0, 0), (-1, -1), "MIDDLE"), ("LEFTPADDING", (0, 0), (-1, -1), 5), ("RIGHTPADDING", (0, 0), (-1, -1), 5)])), Spacer(1, 7 * mm), Paragraph("Use only with project-specific verification. The responsible professional or contract administrator remains accountable for any decision made from this material.", small)]
    doc.build(story, onFirstPage=header_footer, onLaterPages=header_footer)


def main():
    for document in DOCUMENTS:
        make_document(*document)
    print(f"Created {len(DOCUMENTS)} PDFs in {OUTPUT}")


if __name__ == "__main__":
    main()
