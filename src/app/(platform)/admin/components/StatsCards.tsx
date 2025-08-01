import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AdminStats } from '@/types/admin';
import { 
  Users, 
  FileText, 
  MessageSquare, 
  BookOpen,
  UserCheck,
  GraduationCap,
  TrendingUp,
  Activity
} from 'lucide-react';

interface StatsCardsProps {
  stats: AdminStats;
}

export default function StatsCards({ stats }: StatsCardsProps) {
  const cards = [
    {
      title: 'Total Users',
      value: stats.totalUsers.toLocaleString(),
      description: `${stats.activeUsers} active this month`,
      icon: Users,
      trend: '+12%',
      color: 'text-blue-600'
    },
    {
      title: 'Resources',
      value: stats.totalResources.toLocaleString(),
      icon: FileText,
      trend: '+8%',
      color: 'text-green-600'
    },
    {
      title: 'Community Posts',
      value: stats.totalPosts.toLocaleString(),
      description: `${stats.totalComments} comments`,
      icon: MessageSquare,
      trend: '+15%',
      color: 'text-purple-600'
    },
    {
      title: 'Learning Paths',
      value: stats.totalLearningPaths.toLocaleString(),
      description: `${stats.completedPaths} completed`,
      icon: BookOpen,
      trend: '+5%',
      color: 'text-orange-600'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {card.title}
            </CardTitle>
            <card.icon className={`h-4 w-4 ${card.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{card.value}</div>
            {card.description && (
              <p className="text-xs text-muted-foreground mt-1">
                {card.description}
              </p>
            )}
            {card.trend && (
              <div className="flex items-center mt-2">
                <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                <span className="text-xs text-green-500">{card.trend}</span>
                <span className="text-xs text-muted-foreground ml-1">vs last month</span>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
