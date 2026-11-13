"use client";

import { useFormContext } from "react-hook-form";
import { Field, Input, Select, SelectableCard, Textarea } from "@/components/ui";
import { dateBounds, type BookingInput } from "@/lib/booking/schema";
import { hasSupportOptions, periods, repairBrands, supportTypes, symptoms, tvSizes, wallTypes } from "@/lib/booking/options";
import { routes } from "@/config/routes";
import type { Service, ServiceCategory } from "@/types";
import { CategoryIcon } from "@/components/services/category-icon";

type F = ReturnType<typeof useFormContext<BookingInput>>;
const msg = (e: F["formState"]["errors"], k: keyof BookingInput) => e[k]?.message as string | undefined;
const opts = (list: readonly string[]) => list.map((o) => <option key={o} value={o}>{o}</option>);

export function StepService({ services, categories }: { services: Service[]; categories: ServiceCategory[] }) {
  const { register, formState: { errors } } = useFormContext<BookingInput>();
  return (
    <fieldset className="flex flex-col gap-6">
      <legend className="sr-only">Escolha o serviço</legend>
      {categories.map((c) => {
        const list = services.filter((s) => s.categoryId === c.id);
        if (list.length === 0) return null;
        return (
          <div key={c.id} className="flex flex-col gap-3">
            <p className="text-lg font-semibold">{c.name}</p>
            <div className="grid gap-3 sm:grid-cols-2">
              {list.map((s) => (
                <SelectableCard
                  key={s.id}
                  type="radio"
                  value={s.slug}
                  title={s.name}
                  description="Sob orçamento"
                  icon={<CategoryIcon id={s.categoryId} />}
                  {...register("serviceSlug")}
                />
              ))}
            </div>
          </div>
        );
      })}
      {msg(errors, "serviceSlug") && <p role="alert" className="text-sm font-medium text-error">{msg(errors, "serviceSlug")}</p>}
      <p className="text-sm text-text-secondary">
        Quer ver o que está incluso? <a className="underline" href={routes.services}>Consulte os serviços</a>.
      </p>
    </fieldset>
  );
}

export function StepDetails({ category }: { category: ServiceCategory["id"] | undefined }) {
  const { register, formState: { errors } } = useFormContext<BookingInput>();
  const repair = category === "assistencia-tecnica";
  return (
    <div className="grid gap-5 sm:grid-cols-2">
      {repair ? (
        <>
          <Field label="Marca da TV" required error={msg(errors, "repairBrand")}>
            {(a) => (
              <Select {...a} {...register("repairBrand")} defaultValue="">
                <option value="" disabled>Selecione</option>
                {opts(repairBrands)}
              </Select>
            )}
          </Field>
          <Field label="Modelo (se souber)">{(a) => <Input {...a} {...register("tvModel")} maxLength={60} />}</Field>
          <Field label="Tamanho da TV">
            {(a) => (
              <Select {...a} {...register("tvSize")} defaultValue="">
                <option value="">Não sei / prefiro não informar</option>
                {opts(tvSizes)}
              </Select>
            )}
          </Field>
          <fieldset className="sm:col-span-2">
            <legend className="mb-2 text-sm font-semibold">O que está acontecendo? <span aria-hidden="true">*</span></legend>
            <div className="grid gap-3 sm:grid-cols-2">
              {symptoms.map((s) => (
                <SelectableCard key={s} type="checkbox" value={s} title={s} {...register("symptoms")} />
              ))}
            </div>
            {msg(errors, "symptoms") && <p role="alert" className="mt-2 text-sm font-medium text-error">{msg(errors, "symptoms")}</p>}
          </fieldset>
        </>
      ) : (
        <>
          <Field label="Tamanho da TV" required error={msg(errors, "tvSize")}>
            {(a) => (
              <Select {...a} {...register("tvSize")} defaultValue="">
                <option value="" disabled>Selecione</option>
                {opts(tvSizes)}
              </Select>
            )}
          </Field>
          <Field label="Marca e modelo (se souber)">
            {(a) => <Input {...a} {...register("tvBrand")} maxLength={60} placeholder="Ex.: Samsung QN55" />}
          </Field>
          {category === "instalacao-suporte" ? (
            <Field label="Tipo de suporte" required error={msg(errors, "supportType")}>
              {(a) => (
                <Select {...a} {...register("supportType")} defaultValue="">
                  <option value="" disabled>Selecione</option>
                  {opts(supportTypes)}
                </Select>
              )}
            </Field>
          ) : (
            <Field label="Suporte" required error={msg(errors, "hasSupport")}>
              {(a) => (
                <Select {...a} {...register("hasSupport")} defaultValue="">
                  <option value="" disabled>Selecione</option>
                  {opts(hasSupportOptions)}
                </Select>
              )}
            </Field>
          )}
          <Field label="Material da parede (se souber)">
            {(a) => (
              <Select {...a} {...register("wallType")} defaultValue="">
                <option value="">Não informar</option>
                {opts(wallTypes)}
              </Select>
            )}
          </Field>
          <Field label="Ambiente" className="sm:col-span-2" hint="Ex.: sala, quarto, escritório.">
            {(a) => <Input {...a} {...register("environment")} maxLength={80} />}
          </Field>
        </>
      )}
      <Field label="Observações" className="sm:col-span-2" hint="Até 500 caracteres.">
        {(a) => <Textarea {...a} {...register("notes")} maxLength={500} />}
      </Field>
      <p className="text-sm text-text-secondary sm:col-span-2">
        O envio de fotos ainda não está disponível. Você poderá enviá-las pelo WhatsApp após a solicitação.
      </p>
    </div>
  );
}

export function StepLocation() {
  const { register, formState: { errors } } = useFormContext<BookingInput>();
  return (
    <div className="grid gap-5 sm:grid-cols-2">
      <Field label="CEP (opcional)" error={msg(errors, "cep")}>
        {(a) => <Input {...a} {...register("cep")} inputMode="numeric" autoComplete="postal-code" maxLength={9} />}
      </Field>
      <Field label="Bairro" required error={msg(errors, "neighborhood")}>
        {(a) => <Input {...a} {...register("neighborhood")} autoComplete="address-level3" />}
      </Field>
      <Field label="Cidade" required error={msg(errors, "city")}>
        {(a) => <Input {...a} {...register("city")} autoComplete="address-level2" />}
      </Field>
      <Field label="Endereço" hint="Rua e número. Pode ser informado depois, na confirmação.">
        {(a) => <Input {...a} {...register("address")} autoComplete="street-address" />}
      </Field>
      <Field label="Complemento" className="sm:col-span-2">
        {(a) => <Input {...a} {...register("complement")} />}
      </Field>
      <p className="text-sm text-text-secondary sm:col-span-2">
        A área de atendimento será confirmada pela equipe após o envio.
      </p>
    </div>
  );
}

export function StepDate() {
  const { register, formState: { errors } } = useFormContext<BookingInput>();
  const { min, max } = dateBounds();
  return (
    <div className="flex flex-col gap-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Data desejada" required error={msg(errors, "preferredDate")} hint="A partir de amanhã.">
          {(a) => <Input {...a} type="date" min={min} max={max} {...register("preferredDate")} />}
        </Field>
      </div>
      <fieldset>
        <legend className="mb-2 text-sm font-semibold">Período desejado <span aria-hidden="true">*</span></legend>
        <div className="grid gap-3 sm:grid-cols-3">
          {periods.map((p) => (
            <SelectableCard key={p.value} type="radio" value={p.value} title={p.label} {...register("preferredPeriod")} />
          ))}
        </div>
        {msg(errors, "preferredPeriod") && <p role="alert" className="mt-2 text-sm font-medium text-error">{msg(errors, "preferredPeriod")}</p>}
      </fieldset>
    </div>
  );
}

export function StepContact() {
  const { register, formState: { errors } } = useFormContext<BookingInput>();
  return (
    <div className="grid gap-5 sm:grid-cols-2">
      <Field label="Nome" required error={msg(errors, "name")}>
        {(a) => <Input {...a} {...register("name")} autoComplete="name" />}
      </Field>
      <Field label="WhatsApp" required error={msg(errors, "phone")} hint="Com DDD.">
        {(a) => <Input {...a} {...register("phone")} type="tel" inputMode="tel" autoComplete="tel" />}
      </Field>
      <div className="sm:col-span-2">
        <label className="flex min-h-11 items-start gap-3">
          <input type="checkbox" className="mt-1 size-5 accent-brand-ink" aria-invalid={errors.consent ? true : undefined} {...register("consent")} />
          <span className="text-sm">
            Li e aceito a <a className="underline" href={routes.privacy} target="_blank" rel="noopener noreferrer">política de privacidade</a> e
            autorizo o contato da MK Design pelo WhatsApp sobre esta solicitação.
          </span>
        </label>
        {errors.consent && <p role="alert" className="mt-2 text-sm font-medium text-error">{errors.consent.message as string}</p>}
      </div>
    </div>
  );
}
