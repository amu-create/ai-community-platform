'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { createChatRoom } from '@/app/actions/chat';
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';

interface CreateRoomDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export default function CreateRoomDialog({
  open,
  onOpenChange,
  onSuccess,
}: CreateRoomDialogProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<'public' | 'private'>('public');
  const [creating, setCreating] = useState(false);
  const { toast } = useToast();

  const handleCreate = async () => {
    if (!name.trim()) {
      toast({
        title: 'Error',
        description: 'Room name is required',
        variant: 'destructive',
      });
      return;
    }

    try {
      setCreating(true);
      await createChatRoom({
        name: name.trim(),
        description: description.trim(),
        type,
      });
      
      toast({
        title: 'Success',
        description: 'Chat room created successfully',
      });
      
      // Reset form
      setName('');
      setDescription('');
      setType('public');
      
      onSuccess();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create chat room',
        variant: 'destructive',
      });
    } finally {
      setCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create Chat Room</DialogTitle>
          <DialogDescription>
            Create a new chat room for your community
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Room Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., General Discussion"
              disabled={creating}
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What is this room about?"
              rows={3}
              disabled={creating}
            />
          </div>
          
          <div className="grid gap-2">
            <Label>Room Type</Label>
            <RadioGroup
              value={type}
              onValueChange={(value) => setType(value as 'public' | 'private')}
              disabled={creating}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="public" id="public" />
                <Label htmlFor="public" className="cursor-pointer font-normal">
                  Public - Anyone can join
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="private" id="private" />
                <Label htmlFor="private" className="cursor-pointer font-normal">
                  Private - Invite only
                </Label>
              </div>
            </RadioGroup>
          </div>
        </div>
        
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={creating}
          >
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={creating}>
            {creating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              'Create Room'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
