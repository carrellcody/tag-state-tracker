import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

export function AdvertiseBox() {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate('/about?subject=Advertising#contact');
  };

  return (
    <Card 
      className="bg-accent/10 border-accent hover:bg-accent/20 transition-colors cursor-pointer p-4 mb-6"
      onClick={handleClick}
    >
      <div className="text-center">
        <h3 className="text-lg font-semibold text-foreground mb-1">Advertise Here</h3>
        <p className="text-sm text-muted-foreground">Reach thousands of Colorado hunters</p>
      </div>
    </Card>
  );
}
