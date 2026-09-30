import { useEffect, useState } from "react";
import { HelpCircle, Scan } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/skl/common";
import { AskQuestionForm, DiagnoseForm } from "./Ask";
import { t } from "@/lib/skl/i18n";

/** The two views combined inside the Crop Help page. */
export type CropHelpTab = "ask" | "diagnose";

/**
 * Combined farmer section: expert consultation (Ask an Expert) and the
 * preliminary image-based crop check (Diagnose Crop) in one page.
 */
export function CropHelpPage({ initialTab = "ask" }: { initialTab?: CropHelpTab }) {
  const [tab, setTab] = useState<CropHelpTab>(initialTab);

  // Keep the visible tab in sync when Crop Help is opened as /crop-help?tab=diagnose
  useEffect(() => {
    setTab(initialTab);
  }, [initialTab]);

  return (
    <>
      <PageHeader
        title={t("Crop Help")}
        subtitle={t(
          "Get help with your crop through expert consultation or a preliminary image-based check.",
        )}
        breadcrumb={["Dashboard", "Crop Help"]}
      />

      <Tabs value={tab} onValueChange={(v) => setTab(v as CropHelpTab)}>
        <Card className="gap-0 p-2 sm:p-3">
          <TabsList className="grid h-auto w-full grid-cols-2 gap-1 bg-muted/70 p-1 sm:inline-grid sm:w-auto sm:min-w-[20rem]">
            <TabsTrigger value="ask" className="h-10 gap-1.5 text-sm">
              <HelpCircle className="size-4" />
              {t("Ask an Expert")}
            </TabsTrigger>
            <TabsTrigger value="diagnose" className="h-10 gap-1.5 text-sm">
              <Scan className="size-4" />
              {t("Diagnose Crop")}
            </TabsTrigger>
          </TabsList>
        </Card>

        <TabsContent value="ask" className="mt-4">
          <AskQuestionForm />
        </TabsContent>

        <TabsContent value="diagnose" className="mt-4">
          <DiagnoseForm onAskExpert={() => setTab("ask")} />
        </TabsContent>
      </Tabs>
    </>
  );
}
