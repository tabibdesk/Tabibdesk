import { Campaign } from "../campaigns.types";
import { Badge } from "@/components/Badge";
import { getBadgeColor } from "@/lib/badgeColors";
import { useAppTranslations } from "@/lib/useAppTranslations";

interface CampaignsTableProps {
  campaigns: Campaign[];
}

export function CampaignsTable({ campaigns }: CampaignsTableProps) {
  const t = useAppTranslations();

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-950">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400 rtl:text-right">
          <thead className="bg-gray-50 text-xs uppercase text-gray-700 dark:bg-gray-900 dark:text-gray-300">
            <tr>
              <th className="px-4 py-3 font-medium">{t.marketing.campaignName}</th>
              <th className="px-4 py-3 font-medium">{t.marketing.source}</th>
              <th className="px-4 py-3 font-medium text-end">{t.marketing.spend}</th>
              <th className="px-4 py-3 font-medium text-end">{t.marketing.leads}</th>
              <th className="px-4 py-3 font-medium text-end">{t.marketing.costPerLead}</th>
              <th className="px-4 py-3 font-medium text-end">{t.marketing.bookings}</th>
              <th className="px-4 py-3 font-medium text-end">{t.marketing.revenue}</th>
              <th className="px-4 py-3 font-medium text-end">{t.marketing.roi}</th>
              <th className="px-4 py-3 font-medium">{t.marketing.status}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
            {campaigns.map((campaign) => (
              <tr
                key={campaign.id}
                className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-900/50"
              >
                <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">
                  {campaign.name}
                </td>
                <td className="px-4 py-3 capitalize">{campaign.source}</td>
                <td className="px-4 py-3 text-end">
                  {campaign.spend.toLocaleString()} EGP
                </td>
                <td className="px-4 py-3 text-end">{campaign.leads}</td>
                <td className="px-4 py-3 text-end">
                  {campaign.costPerLead.toFixed(0)} EGP
                </td>
                <td className="px-4 py-3 text-end">{campaign.bookings}</td>
                <td className="px-4 py-3 text-end">
                  {campaign.revenue.toLocaleString()} EGP
                </td>
                <td className="px-4 py-3 text-end text-green-600 font-medium">
                  {campaign.roi}%
                </td>
                <td className="px-4 py-3">
                  <Badge
                    color={getBadgeColor(
                      campaign.status === "active"
                        ? "success"
                        : campaign.status === "paused"
                        ? "warning"
                        : "neutral"
                    )}
                    size="xs"
                  >
                    {campaign.status}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
