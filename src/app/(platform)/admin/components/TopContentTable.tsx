import { TopContent } from '@/types/admin';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { FileText, MessageSquare, BookOpen, Eye, ThumbsUp, MessageCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface TopContentTableProps {
  content: TopContent[];
}

export default function TopContentTable({ content }: TopContentTableProps) {
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'resource':
        return <FileText className="h-4 w-4" />;
      case 'post':
        return <MessageSquare className="h-4 w-4" />;
      case 'learning_path':
        return <BookOpen className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const getTypeBadgeVariant = (type: string) => {
    switch (type) {
      case 'resource':
        return 'default';
      case 'post':
        return 'secondary';
      case 'learning_path':
        return 'outline';
      default:
        return 'default';
    }
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Content</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Author</TableHead>
            <TableHead className="text-center">
              <Eye className="h-4 w-4 inline" />
            </TableHead>
            <TableHead className="text-center">
              <ThumbsUp className="h-4 w-4 inline" />
            </TableHead>
            <TableHead className="text-center">
              <MessageCircle className="h-4 w-4 inline" />
            </TableHead>
            <TableHead>Created</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {content.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center text-muted-foreground">
                No content data available
              </TableCell>
            </TableRow>
          ) : (
            content.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium max-w-xs truncate">
                  {item.title}
                </TableCell>
                <TableCell>
                  <Badge variant={getTypeBadgeVariant(item.type) as any} className="gap-1">
                    {getTypeIcon(item.type)}
                    {item.type.replace('_', ' ')}
                  </Badge>
                </TableCell>
                <TableCell>{item.author}</TableCell>
                <TableCell className="text-center">{item.views}</TableCell>
                <TableCell className="text-center">{item.likes}</TableCell>
                <TableCell className="text-center">{item.comments}</TableCell>
                <TableCell className="text-muted-foreground">
                  {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
