# src/services/oscal_exporter.py
# AutoNIST Core OSCAL Exporter
# Generates OSCAL-compliant XML for SSP and POA&M outputs.

from datetime import datetime
from pathlib import Path
import xml.etree.ElementTree as ET
import json

from src.services.poam_generator import list_poam_entries

EXPORT_DIR = Path("data/exports")
EXPORT_DIR.mkdir(parents=True, exist_ok=True)


def export_ssp(evaluations: list):
    """
    Creates an OSCAL-style SSP XML snapshot from current evaluation results.
    """
    root = ET.Element("system-security-plan", attrib={
        "uuid": "autonist-core-ssp",
        "version": "1.0",
        "date": datetime.utcnow().isoformat() + "Z"
    })

    metadata = ET.SubElement(root, "metadata")
    ET.SubElement(metadata, "title").text = "AutoNIST Core SSP"
    ET.SubElement(metadata, "last-modified").text = datetime.utcnow().isoformat() + "Z"

    impl = ET.SubElement(root, "control-implementation")
    for record in evaluations:
        control = ET.SubElement(impl, "implemented-requirement", attrib={"control-id": record["control_id"]})
        ET.SubElement(control, "status").text = record["status"]
        ET.SubElement(control, "statement").text = record["finding"]
        ET.SubElement(control, "risk-level").text = record.get("risk_level", "N/A")

    tree = ET.ElementTree(root)
    out_file = EXPORT_DIR / "oscal_ssp.xml"
    tree.write(out_file, encoding="utf-8", xml_declaration=True)
    return str(out_file)


def export_poam():
    """
    Converts existing POA&M JSON entries to OSCAL POA&M XML format.
    """
    poam_entries = list_poam_entries()
    root = ET.Element("plan-of-action-and-milestones", attrib={
        "uuid": "autonist-core-poam",
        "version": "1.0",
        "date": datetime.utcnow().isoformat() + "Z"
    })

    for entry in poam_entries:
        item = ET.SubElement(root, "poam-item", attrib={"control-id": entry["control_id"]})
        ET.SubElement(item, "poam-id").text = entry["poam_id"]
        ET.SubElement(item, "finding").text = entry["finding"]
        ET.SubElement(item, "risk-level").text = entry["risk_level"]
        ET.SubElement(item, "status").text = entry["status"]
        ET.SubElement(item, "mitigation").text = entry["mitigation"]
        ET.SubElement(item, "last-updated").text = entry["last_updated"]

    tree = ET.ElementTree(root)
    out_file = EXPORT_DIR / "oscal_poam.xml"
    tree.write(out_file, encoding="utf-8", xml_declaration=True)
    return str(out_file)
