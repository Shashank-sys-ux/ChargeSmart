
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Brain } from "lucide-react";

interface MLStatusPanelProps {
  isTraining: boolean;
  trainingProgress: number;
}

const MLStatusPanel = ({ isTraining, trainingProgress }: MLStatusPanelProps) => {
  if (!isTraining) return null;

  return (
    <Card className="bg-blue-50 border-blue-200 mb-6">
      <CardContent className="p-4">
        <div className="flex items-center space-x-4">
          <Brain className="w-6 h-6 text-blue-600 animate-pulse" />
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-blue-900">Training Enhanced ML Model...</span>
              <span className="text-sm text-blue-700">{Math.round(trainingProgress * 100)}%</span>
            </div>
            <Progress value={trainingProgress * 100} className="h-2" />
            <div className="text-sm text-blue-600 mt-1">
              Deep learning with location patterns • 90 days historical data
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MLStatusPanel;
