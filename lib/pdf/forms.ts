import { PDFTextField, PDFCheckBox, PDFRadioGroup, PDFDropdown } from "pdf-lib";
import { loadPdf, savePdf } from "./core";

export interface FormFieldInfo {
  name: string;
  type: string;
  value: string;
}

export async function listFormFields(pdfBytes: Uint8Array): Promise<FormFieldInfo[]> {
  const doc = await loadPdf(pdfBytes);
  const form = doc.getForm();
  const fields = form.getFields();
  return fields.map((f) => {
    let type = f.constructor.name;
    let value = "";
    try {
      if (f instanceof PDFTextField) value = f.getText() || "";
      else if (f instanceof PDFCheckBox) value = f.isChecked() ? "true" : "false";
      else if (f instanceof PDFRadioGroup) value = f.getSelected() || "";
      else if (f instanceof PDFDropdown) value = f.getSelected()?.join(", ") || "";
    } catch (err) {
      console.warn(`listFormFields: could not read value of field "${f.getName()}"`, err);
    }
    return { name: f.getName(), type, value };
  });
}

export async function fillForm(
  pdfBytes: Uint8Array,
  values: Record<string, string>
): Promise<Uint8Array> {
  const doc = await loadPdf(pdfBytes);
  const form = doc.getForm();
  for (const [name, val] of Object.entries(values)) {
    try {
      const field = form.getFieldMaybe(name);
      if (!field) continue;
      if (field instanceof PDFTextField) field.setText(val);
      else if (field instanceof PDFCheckBox) {
        if (val === "true" || val === "1" || val.toLowerCase() === "yes") field.check();
        else field.uncheck();
      } else if (field instanceof PDFRadioGroup) field.select(val);
      else if (field instanceof PDFDropdown) field.select(val);
    } catch (err) {
      console.warn(`fillForm: could not set field "${name}"`, err);
    }
  }
  return savePdf(doc);
}
