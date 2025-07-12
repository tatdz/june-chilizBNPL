import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import type { Asset } from "@shared/schema";

interface FeaturedAssetsProps {
  onSelectAsset: (asset: Asset) => void;
}

export default function FeaturedAssets({ onSelectAsset }: FeaturedAssetsProps) {
  const { toast } = useToast();

  const { data: assets, isLoading, error } = useQuery<Asset[]>({
    queryKey: ['/api/assets'],
  });

  const handleSelectAsset = (asset: Asset) => {
    onSelectAsset(asset);
    toast({
      title: "Asset Selected",
      description: `Starting BNPL process for ${asset.name}`,
    });
  };

  if (isLoading) {
    return (
      <section className="mb-12">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-slate-900">Featured Assets</h2>
          <span className="text-primary hover:text-primary/80 font-medium">View All →</span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="overflow-hidden">
              <Skeleton className="w-full h-48" />
              <CardContent className="p-6">
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full mb-4" />
                <div className="flex items-center justify-between">
                  <Skeleton className="h-8 w-20" />
                  <Skeleton className="h-10 w-32" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="mb-12">
        <div className="text-center py-12">
          <p className="text-slate-600">Failed to load assets. Please try again later.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="mb-12">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold text-slate-900">Featured Assets</h2>
        <a href="#" className="text-primary hover:text-primary/80 font-medium">View All →</a>
      </div>
      
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-8">
        <p className="text-sm text-amber-800">
          <strong>Note:</strong> All merchants and assets (PSG jerseys, Air France flights, Marriott hotels, UEFA Champions League tickets) shown are examples only. Real partnerships via merchant search where you can pay with June and deals are coming soon!
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {assets?.map((asset) => (
          <Card 
            key={asset.id} 
            className="overflow-hidden border border-slate-200 hover:shadow-lg transition-shadow flex flex-col h-full"
          >
            <img 
              src={asset.symbol === 'PSG-JERSEY' ? '/psg-jersey.avif' : asset.imageUrl} 
              alt={asset.name}
              className="w-full h-48 object-contain bg-gray-50" 
            />
            <CardContent className="p-6 flex flex-col h-full">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-slate-900 text-sm leading-tight">{asset.name}</h3>
                <Badge 
                  variant="secondary" 
                  className="bg-blue-100 text-blue-800 hover:bg-blue-100 text-xs ml-2 flex-shrink-0"
                >
                  {asset.category}
                </Badge>
              </div>
              <p className="text-slate-600 text-sm mb-4 flex-grow">{asset.description}</p>
              <div className="flex items-center justify-between mt-auto">
                <span className="text-xl font-bold text-slate-900">€{asset.price}</span>
                <Button 
                  onClick={() => handleSelectAsset(asset)}
                  className="bg-primary hover:bg-primary/90 text-white font-medium text-sm px-4 py-2"
                >
                  Buy with BNPL
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
