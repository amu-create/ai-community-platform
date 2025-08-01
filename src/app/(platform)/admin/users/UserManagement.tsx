'use client';

import { useEffect, useState } from 'react';
import { 
  getAllUsers, 
  updateUserRole, 
  toggleUserStatus 
} from '@/app/actions/admin';
import { AdminUser } from '@/types/admin';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Search, 
  MoreVertical, 
  Shield, 
  UserX, 
  UserCheck,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/components/ui/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

interface UserManagementProps {
  userRole: 'admin' | 'moderator';
}

export default function UserManagement({ userRole }: UserManagementProps) {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [updating, setUpdating] = useState<string | null>(null);
  const { toast } = useToast();
  
  const USERS_PER_PAGE = 20;
  const totalPages = Math.ceil(total / USERS_PER_PAGE);

  useEffect(() => {
    loadUsers();
  }, [page, search]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await getAllUsers(page, USERS_PER_PAGE, search);
      setUsers(data.users);
      setTotal(data.total);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load users',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: 'user' | 'admin' | 'moderator') => {
    if (userRole !== 'admin') {
      toast({
        title: 'Permission Denied',
        description: 'Only admins can change user roles',
        variant: 'destructive',
      });
      return;
    }

    try {
      setUpdating(userId);
      await updateUserRole(userId, newRole);
      
      setUsers(users.map(user => 
        user.id === userId ? { ...user, role: newRole } : user
      ));
      
      toast({
        title: 'Success',
        description: 'User role updated successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update user role',
        variant: 'destructive',
      });
    } finally {
      setUpdating(null);
    }
  };

  const handleStatusToggle = async (userId: string, suspend: boolean) => {
    try {
      setUpdating(userId);
      await toggleUserStatus(userId, suspend, suspend ? 7 : undefined);
      
      setUsers(users.map(user => 
        user.id === userId 
          ? { ...user, status: suspend ? 'suspended' : 'active' } 
          : user
      ));
      
      toast({
        title: 'Success',
        description: suspend ? 'User suspended for 7 days' : 'User activated',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update user status',
        variant: 'destructive',
      });
    } finally {
      setUpdating(null);
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin':
        return 'destructive';
      case 'moderator':
        return 'default';
      default:
        return 'secondary';
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'active':
        return 'default';
      case 'suspended':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">User Management</h1>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="pl-10 w-64"
            />
          </div>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead>Last Active</TableHead>
              <TableHead>Content</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-8" /></TableCell>
                </TableRow>
              ))
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground">
                  No users found
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{user.username || 'No username'}</div>
                      <div className="text-sm text-muted-foreground">{user.email}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getRoleBadgeVariant(user.role) as any}>
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(user.status) as any}>
                      {user.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {format(new Date(user.createdAt), 'MMM dd, yyyy')}
                  </TableCell>
                  <TableCell>
                    {user.lastSignIn 
                      ? format(new Date(user.lastSignIn), 'MMM dd, yyyy')
                      : 'Never'
                    }
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>{user.stats.posts} posts</div>
                      <div>{user.stats.comments} comments</div>
                      <div>{user.stats.resources} resources</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          disabled={updating === user.id}
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        
                        {userRole === 'admin' && (
                          <>
                            <DropdownMenuItem 
                              onClick={() => handleRoleChange(user.id, 'admin')}
                              disabled={user.role === 'admin'}
                            >
                              <Shield className="h-4 w-4 mr-2" />
                              Make Admin
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleRoleChange(user.id, 'moderator')}
                              disabled={user.role === 'moderator'}
                            >
                              <Shield className="h-4 w-4 mr-2" />
                              Make Moderator
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleRoleChange(user.id, 'user')}
                              disabled={user.role === 'user'}
                            >
                              <UserCheck className="h-4 w-4 mr-2" />
                              Make User
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                          </>
                        )}
                        
                        {user.status === 'active' ? (
                          <DropdownMenuItem 
                            onClick={() => handleStatusToggle(user.id, true)}
                            className="text-destructive"
                          >
                            <UserX className="h-4 w-4 mr-2" />
                            Suspend User
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem 
                            onClick={() => handleStatusToggle(user.id, false)}
                          >
                            <UserCheck className="h-4 w-4 mr-2" />
                            Activate User
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {(page - 1) * USERS_PER_PAGE + 1} to {Math.min(page * USERS_PER_PAGE, total)} of {total} users
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <div className="text-sm">
              Page {page} of {totalPages}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page + 1)}
              disabled={page === totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
