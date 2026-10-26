import { PDF_TOOLS } from "@/lib/tools-data";
import { EditPdfPageClient } from "@/components/edit-pdf/EditPdfPageClient";

const toolMeta = PDF_TOOLS.find((t) => t.id === "edit-pdf");

export default function EditPdfPage() {
  return <EditPdfPageClient toolMeta={toolMeta} />;
}
