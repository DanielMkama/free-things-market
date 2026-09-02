import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { OfferWithAuthor, RequestWithAuthor } from "@/lib/queries";
import { Avatar, Tag } from "@/components/ui/primitives";
import { locationLabel } from "@/lib/utils";
import { CATEGORY_EMOJI } from "@/lib/taxonomy";

export function OfferCard({ offer }: { offer: OfferWithAuthor }) {
  return (
    <Link
      href={`/give/${offer.slug}`}
      className="u-card group flex flex-col p-6"
    >
      <div className="mb-8 flex items-start justify-between gap-4">
        <span className="text-2xl">
          {CATEGORY_EMOJI[offer.category] ?? "✨"}
        </span>
        <span className="text-right text-xs font-semibold tracking-widest text-muted">
          {locationLabel(offer)}
        </span>
      </div>

      <h3 className="font-display text-2xl leading-[0.95] tracking-tight md:text-[1.7rem]">
        {offer.title}
      </h3>
      <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-muted">
        {offer.description}
      </p>

      <div className="mt-6 flex flex-wrap gap-2">
        <Tag tone="ink">{offer.type}</Tag>
        <Tag>{offer.category}</Tag>
        {offer.availability ? <Tag>{offer.availability}</Tag> : null}
      </div>

      <div className="mt-6 flex items-center justify-between border-t border-line pt-4">
        <span className="flex items-center gap-2 text-sm font-semibold">
          <Avatar
            name={offer.author.name}
            color={offer.author.avatarColor}
            url={offer.author.avatarUrl}
            size={26}
          />
          {offer.author.name}
        </span>
        <ArrowUpRight
          size={20}
          className="transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
        />
      </div>
    </Link>
  );
}

export function RequestRow({ request }: { request: RequestWithAuthor }) {
  return (
    <Link
      href={`/need/${request.slug}`}
      className="group grid gap-3 border-t border-line py-7 transition hover:bg-white/50 md:grid-cols-[150px_1fr_180px] md:gap-6"
    >
      <div className="flex items-start gap-2">
        <span className="text-xl">
          {CATEGORY_EMOJI[request.category] ?? "✨"}
        </span>
        <span className="text-xs font-bold tracking-widest text-muted">
          {request.type}
        </span>
      </div>
      <div>
        <h3 className="font-display text-2xl leading-[0.95] tracking-tight md:text-3xl">
          {request.title}
        </h3>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
          {request.description}
        </p>
        <div className="mt-3 flex items-center gap-2 text-sm font-semibold">
          <Avatar
            name={request.author.name}
            color={request.author.avatarColor}
            url={request.author.avatarUrl}
            size={22}
          />
          {request.author.name}
        </div>
      </div>
      <div className="flex items-start justify-between gap-2 text-xs font-semibold tracking-widest text-muted md:flex-col md:items-end md:text-right">
        <span>{locationLabel(request)}</span>
        <span>{request.urgency}</span>
        <ArrowUpRight
          size={18}
          className="transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
        />
      </div>
    </Link>
  );
}
