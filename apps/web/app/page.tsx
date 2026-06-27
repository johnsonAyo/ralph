"use client";
import Link from "next/link";
import {
  ArrowRight,
  Camera,
  Check,
  FileSearch,
  Receipt,
  ShieldCheck,
  Target,
  Users,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Badge,
  Button,
  Card,
  CardContent,
  Container,
  RiskMeter,
  Separator,
} from "@ralph/ui";
import { getStripeLookupKey } from "./lib/site-url";
import { landingLabels } from "./labels";
import {
  pricing,
  aiInputs,
  reportAnswers,
  aboutIntro,
  aboutSections,
  faqs,
  whyUseCards,
} from "./constants";
import { useSession } from "./lib/supabase";
import { useCheckout } from "./lib/use-checkout";
import { HomeShellSkeleton } from "./components/skeleton";
import CTA from "./components/cta";

const whyIconMap = {
  FileSearch,
  Receipt,
  ShieldCheck,
  Target,
  Camera,
  Users,
} as const;

const costBreakdown: Array<[string, string]> = [
  ["Current price", "£2,150"],
  ["Fees / admin", "£570"],
  ["Delivery", "£290"],
  ["Repair allowance", "£1,450"],
];

function SectionHeading({
  title,
  kicker,
  note,
}: {
  title: string;
  kicker?: string;
  note?: string;
}) {
  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center gap-3 text-center">
      {kicker ? (
        <span className="text-xs font-semibold uppercase tracking-[0.18em] text-brand">
          {kicker}
        </span>
      ) : null}
      <h2 className="text-balance font-serif text-3xl font-semibold tracking-tight sm:text-4xl">
        {title}
      </h2>
      {note ? (
        <p className="text-pretty text-muted-foreground">{note}</p>
      ) : null}
    </div>
  );
}

/** Product-preview card standing in for the live report — concrete, on-brand. */
function ReportPreviewCard() {
  return (
    <Card className="w-full max-w-md shadow-lg">
      <CardContent className="flex flex-col gap-5 p-6">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Ralph&rsquo;s verdict
            </span>
            <span className="font-serif text-xl font-semibold tracking-tight">
              Consider below £1,850
            </span>
          </div>
          <Badge variant="warning">Medium certainty</Badge>
        </div>
        <RiskMeter level="caution" label="Worth a look — bid with care" />
        <Separator />
        <div className="flex flex-col gap-2.5">
          {costBreakdown.map(([label, value]) => (
            <div
              key={label}
              className="flex items-center justify-between text-sm"
            >
              <span className="text-muted-foreground">{label}</span>
              <span className="font-mono font-medium tabular-nums">
                {value}
              </span>
            </div>
          ))}
          <Separator className="my-1" />
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Estimated total cost</span>
            <span className="font-mono text-lg font-semibold tabular-nums">
              £4,460
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Home() {
  const { isLoading } = useSession();
  const checkout = useCheckout();

  if (isLoading) {
    return <HomeShellSkeleton />;
  }

  const checkoutError = checkout.error?.message ?? null;

  function startCheckout(tier: string) {
    checkout.mutate(getStripeLookupKey(tier));
  }

  return (
    <main>
      {/* Hero */}
      <section id="top" className="relative overflow-hidden">
        <Container className="grid items-center gap-12 py-16 lg:grid-cols-2 lg:py-24">
          <div className="flex flex-col items-start gap-6">
            <Badge variant="brand">{landingLabels.hero.eyebrow}</Badge>
            <h1 className="text-balance font-serif text-display font-semibold">
              {landingLabels.hero.title}
            </h1>
            <p className="max-w-xl text-pretty text-lg text-muted-foreground">
              {landingLabels.hero.copy}
            </p>
            <div className="flex flex-col gap-3">
              <CTA>{landingLabels.hero.cta}</CTA>
              <p className="text-sm text-muted-foreground">
                {landingLabels.hero.subtext}
              </p>
            </div>
          </div>
          <div className="flex justify-center lg:justify-end">
            <ReportPreviewCard />
          </div>
        </Container>
      </section>

      {/* How Ralph reads a listing + start check */}
      <section id="check" className="border-t border-border bg-muted/40">
        <Container className="grid gap-10 py-16 lg:grid-cols-2 lg:py-20">
          <div className="flex flex-col gap-5">
            <h3 className="font-serif text-2xl font-semibold tracking-tight">
              {landingLabels.aiExplainer.title}
            </h3>
            <p className="text-pretty text-muted-foreground">
              {landingLabels.aiExplainer.copy}
            </p>
            <div className="flex flex-wrap gap-2">
              {aiInputs.map((input) => (
                <Badge key={input} variant="outline">
                  {input}
                </Badge>
              ))}
            </div>
          </div>
          <Card className="flex flex-col items-center justify-center gap-4 p-8 text-center">
            <h3 className="font-serif text-xl font-semibold tracking-tight">
              Start a new Ralph check
            </h3>
            <p className="max-w-sm text-sm text-muted-foreground">
              The full report form lives in your dashboard. Sign in and open it
              from the sidebar.
            </p>
            <Button asChild size="lg">
              <Link href="/dashboard/new">
                Open the new report form
                <ArrowRight />
              </Link>
            </Button>
          </Card>
        </Container>
      </section>

      {/* Answers */}
      <section id="answers">
        <Container className="flex flex-col gap-10 py-16 lg:py-20">
          <SectionHeading title={landingLabels.answers.title} kicker="Report" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {reportAnswers.map((answer) => (
              <Card key={answer} className="p-5">
                <p className="text-pretty font-medium">{answer}</p>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      {/* Budget breakdown */}
      <section className="border-t border-border bg-muted/40">
        <Container className="grid items-center gap-10 py-16 lg:grid-cols-2 lg:py-20">
          <div className="flex flex-col gap-4">
            <h2 className="text-balance font-serif text-3xl font-semibold tracking-tight">
              {landingLabels.budget.title}
            </h2>
            <p className="text-pretty text-muted-foreground">
              {landingLabels.budget.copy}
            </p>
          </div>
          <Card className="shadow-md">
            <CardContent className="flex flex-col gap-3 p-6">
              {costBreakdown.map(([label, value]) => (
                <div
                  key={label}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="text-muted-foreground">{label}</span>
                  <span className="font-mono font-medium tabular-nums">
                    {value}
                  </span>
                </div>
              ))}
              <Separator className="my-1" />
              <div className="flex items-center justify-between">
                <span className="font-medium">Estimated total cost</span>
                <span className="font-mono text-xl font-semibold tabular-nums">
                  £4,460
                </span>
              </div>
            </CardContent>
          </Card>
        </Container>
      </section>

      {/* Why */}
      <section id="why">
        <Container className="flex flex-col gap-10 py-16 lg:py-20">
          <SectionHeading title={landingLabels.why.title} kicker="Why Ralph" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {whyUseCards.map((card) => {
              const Icon = whyIconMap[card.iconName];
              return (
                <Card key={card.title} className="flex flex-col gap-3 p-6">
                  <span className="flex size-10 items-center justify-center rounded-md bg-brand/10 text-brand">
                    <Icon className="size-5" />
                  </span>
                  <h3 className="font-semibold tracking-tight">{card.title}</h3>
                  <p className="text-sm text-muted-foreground">{card.body}</p>
                </Card>
              );
            })}
          </div>
        </Container>
      </section>

      {/* Pricing */}
      <section id="pricing" className="border-t border-border bg-muted/40">
        <Container className="flex flex-col gap-10 py-16 lg:py-20">
          <SectionHeading
            title={landingLabels.pricing.title}
            kicker="Pricing"
            note={landingLabels.pricing.note}
          />
          {checkoutError ? (
            <p className="text-center text-sm font-medium text-destructive">
              {checkoutError}
            </p>
          ) : null}
          <div className="mx-auto grid w-full max-w-5xl gap-5 lg:grid-cols-3">
            {pricing.map(([tier, reports, price, features]) => {
              const featured = tier === "Buyer";
              return (
                <Card
                  key={tier}
                  className={
                    featured
                      ? "relative border-brand shadow-lg ring-1 ring-brand"
                      : ""
                  }
                >
                  <CardContent className="flex h-full flex-col gap-5 p-6">
                    {featured ? (
                      <Badge variant="brand" className="absolute right-6 top-6">
                        Popular
                      </Badge>
                    ) : null}
                    <div className="flex flex-col gap-1">
                      <span className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
                        {tier}
                      </span>
                      <span className="font-serif text-xl font-semibold tracking-tight">
                        {reports}
                      </span>
                    </div>
                    <span className="font-mono text-4xl font-semibold tabular-nums">
                      {price}
                    </span>
                    <ul className="flex flex-1 flex-col gap-2.5">
                      {features.map((feature) => (
                        <li
                          key={feature}
                          className="flex items-start gap-2 text-sm text-muted-foreground"
                        >
                          <Check className="mt-0.5 size-4 shrink-0 text-success" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Button
                      variant={featured ? "brand" : "outline"}
                      onClick={() => startCheckout(tier)}
                      disabled={checkout.isPending}
                    >
                      {checkout.isPending
                        ? "Connecting…"
                        : tier === "Protected"
                          ? "Get Protected"
                          : "Ask Ralph"}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </Container>
      </section>

      {/* About */}
      <section id="about">
        <Container className="flex flex-col gap-10 py-16 lg:py-20">
          <SectionHeading title={landingLabels.about.title} kicker="How it works" />
          <p className="mx-auto max-w-3xl text-pretty text-center text-muted-foreground">
            {aboutIntro}
          </p>
          <div className="mx-auto grid w-full max-w-3xl gap-5">
            {aboutSections.map((section) => (
              <Card key={section.id} id={section.id} className="p-6">
                <h3 className="mb-2 font-serif text-lg font-semibold tracking-tight">
                  {section.heading}
                </h3>
                <p className="text-pretty text-muted-foreground">
                  {section.body}
                </p>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      {/* FAQs */}
      <section id="faqs" className="border-t border-border bg-muted/40">
        <Container className="flex flex-col gap-10 py-16 lg:py-20">
          <SectionHeading title={landingLabels.faqs.title} kicker="FAQs" />
          <div className="mx-auto w-full max-w-3xl">
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq) => (
                <AccordionItem key={faq.question} value={faq.question}>
                  <AccordionTrigger className="text-base font-medium text-foreground">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-pretty text-muted-foreground">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </Container>
      </section>
    </main>
  );
}
