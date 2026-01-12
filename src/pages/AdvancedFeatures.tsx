import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Archive, GitBranch, Bell, BarChart3, Calendar, Filter, Mail, Activity, Zap, FolderArchive, Clock, RefreshCw, Trash2, Play, Plus } from 'lucide-react';
import { getCurrentUserId } from '@/lib/api';
import {
  archiveApi,
  versioningApi,
  reminderApi,
  analyticsApi,
  calendarApi,
  smartFilterApi,
  notificationApi,
  usageAnalyticsApi,
  integrationApi,
  projectArchiveApi,
} from '@/lib/assignment12Api';
import { mockTags, mockItems } from '@/lib/mockData';

const AdvancedFeatures = () => {
  const userId = getCurrentUserId();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('archiving');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Advanced Features</h1>
        <p className="text-muted-foreground">Assignment #12: Final Unique Features & Integrations</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5 lg:grid-cols-10 h-auto gap-1">
          <TabsTrigger value="archiving" className="text-xs"><Archive className="w-3 h-3 mr-1" />Archive</TabsTrigger>
          <TabsTrigger value="versioning" className="text-xs"><GitBranch className="w-3 h-3 mr-1" />Versions</TabsTrigger>
          <TabsTrigger value="reminders" className="text-xs"><Bell className="w-3 h-3 mr-1" />Reminders</TabsTrigger>
          <TabsTrigger value="analytics" className="text-xs"><BarChart3 className="w-3 h-3 mr-1" />Analytics</TabsTrigger>
          <TabsTrigger value="calendar" className="text-xs"><Calendar className="w-3 h-3 mr-1" />Calendar</TabsTrigger>
          <TabsTrigger value="filters" className="text-xs"><Filter className="w-3 h-3 mr-1" />Filters</TabsTrigger>
          <TabsTrigger value="notifications" className="text-xs"><Mail className="w-3 h-3 mr-1" />Notify</TabsTrigger>
          <TabsTrigger value="usage" className="text-xs"><Activity className="w-3 h-3 mr-1" />Usage</TabsTrigger>
          <TabsTrigger value="integrations" className="text-xs"><Zap className="w-3 h-3 mr-1" />Integrate</TabsTrigger>
          <TabsTrigger value="backups" className="text-xs"><FolderArchive className="w-3 h-3 mr-1" />Backups</TabsTrigger>
        </TabsList>

        <TabsContent value="archiving"><ArchivingTab userId={userId} /></TabsContent>
        <TabsContent value="versioning"><VersioningTab userId={userId} /></TabsContent>
        <TabsContent value="reminders"><RemindersTab userId={userId} /></TabsContent>
        <TabsContent value="analytics"><AnalyticsTab userId={userId} /></TabsContent>
        <TabsContent value="calendar"><CalendarTab userId={userId} /></TabsContent>
        <TabsContent value="filters"><FiltersTab userId={userId} /></TabsContent>
        <TabsContent value="notifications"><NotificationsTab userId={userId} /></TabsContent>
        <TabsContent value="usage"><UsageTab /></TabsContent>
        <TabsContent value="integrations"><IntegrationsTab userId={userId} /></TabsContent>
        <TabsContent value="backups"><BackupsTab userId={userId} /></TabsContent>
      </Tabs>
    </div>
  );
};

// Archiving Tab
const ArchivingTab = ({ userId }: { userId: number }) => {
  const queryClient = useQueryClient();
  const [selectedItem, setSelectedItem] = useState<string>('');

  const { data: archivedItems, isLoading } = useQuery({
    queryKey: ['archivedItems'],
    queryFn: () => archiveApi.getArchivedItems(userId),
  });

  const archiveMutation = useMutation({
    mutationFn: (itemId: number) => archiveApi.archiveItem(itemId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['archivedItems'] });
      toast.success('Item archived successfully');
    },
  });

  const restoreMutation = useMutation({
    mutationFn: (archiveId: number) => archiveApi.restoreItem(archiveId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['archivedItems'] });
      toast.success('Item restored');
    },
  });

  const autoArchiveMutation = useMutation({
    mutationFn: () => archiveApi.runAutoArchive(userId, 30),
    onSuccess: (count) => {
      queryClient.invalidateQueries({ queryKey: ['archivedItems'] });
      toast.success(`Auto-archived ${count} old items`);
    },
  });

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Archive className="w-5 h-5" />
            Manual Archive
          </CardTitle>
          <CardDescription>Archive items manually</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Select Item to Archive</Label>
            <Select value={selectedItem} onValueChange={setSelectedItem}>
              <SelectTrigger>
                <SelectValue placeholder="Select an item" />
              </SelectTrigger>
              <SelectContent>
                {mockItems.map(item => (
                  <SelectItem key={item.id} value={String(item.id)}>{item.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button 
            onClick={() => selectedItem && archiveMutation.mutate(Number(selectedItem))}
            disabled={!selectedItem || archiveMutation.isPending}
          >
            <Archive className="w-4 h-4 mr-2" />
            Archive Item
          </Button>
          <div className="border-t pt-4">
            <Button variant="outline" onClick={() => autoArchiveMutation.mutate()} disabled={autoArchiveMutation.isPending}>
              <Clock className="w-4 h-4 mr-2" />
              Auto-Archive Old Items (30+ days)
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Archived Items</CardTitle>
          <CardDescription>{archivedItems?.length || 0} items archived</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p>Loading...</p>
          ) : archivedItems?.length === 0 ? (
            <p className="text-muted-foreground">No archived items</p>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {archivedItems?.map(item => (
                <div key={item.id} className="flex items-center justify-between p-2 border rounded">
                  <div>
                    <p className="font-medium text-sm">{item.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.reason === 'manual' ? 'Manual' : 'Auto'} • {new Date(item.archivedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Button size="sm" variant="ghost" onClick={() => restoreMutation.mutate(item.id)}>
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

// Versioning Tab
const VersioningTab = ({ userId }: { userId: number }) => {
  const queryClient = useQueryClient();
  const [selectedItem, setSelectedItem] = useState<string>('');

  const { data: versions } = useQuery({
    queryKey: ['versions', selectedItem],
    queryFn: () => versioningApi.getItemVersions(Number(selectedItem)),
    enabled: !!selectedItem,
  });

  const createVersionMutation = useMutation({
    mutationFn: () => {
      const item = mockItems.find(i => i.id === Number(selectedItem));
      return versioningApi.createVersion(Number(selectedItem), item || {}, userId, 'Manual snapshot');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['versions', selectedItem] });
      toast.success('Version created');
    },
  });

  const revertMutation = useMutation({
    mutationFn: (versionId: number) => versioningApi.revertToVersion(Number(selectedItem), versionId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['versions', selectedItem] });
      toast.success('Reverted to version');
    },
  });

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GitBranch className="w-5 h-5" />
            Object Versioning
          </CardTitle>
          <CardDescription>Track and revert changes</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Select Item</Label>
            <Select value={selectedItem} onValueChange={setSelectedItem}>
              <SelectTrigger>
                <SelectValue placeholder="Select an item" />
              </SelectTrigger>
              <SelectContent>
                {mockItems.map(item => (
                  <SelectItem key={item.id} value={String(item.id)}>{item.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={() => createVersionMutation.mutate()} disabled={!selectedItem || createVersionMutation.isPending}>
            <Plus className="w-4 h-4 mr-2" />
            Create Version Snapshot
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Version History</CardTitle>
          <CardDescription>{versions?.length || 0} versions</CardDescription>
        </CardHeader>
        <CardContent>
          {!selectedItem ? (
            <p className="text-muted-foreground">Select an item to view versions</p>
          ) : versions?.length === 0 ? (
            <p className="text-muted-foreground">No versions yet</p>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {versions?.map(version => (
                <div key={version.id} className="flex items-center justify-between p-2 border rounded">
                  <div>
                    <p className="font-medium text-sm">Version {version.versionNumber}</p>
                    <p className="text-xs text-muted-foreground">
                      {version.changeDescription || 'No description'} • {new Date(version.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => revertMutation.mutate(version.id)}>
                    Revert
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

// Reminders Tab
const RemindersTab = ({ userId }: { userId: number }) => {
  const queryClient = useQueryClient();
  const [selectedTag, setSelectedTag] = useState<string>('');
  const [condition, setCondition] = useState<string>('no_update');
  const [threshold, setThreshold] = useState('7');
  const [message, setMessage] = useState('Item {{itemTitle}} needs attention');

  const { data: reminders } = useQuery({
    queryKey: ['reminders'],
    queryFn: () => reminderApi.getActiveReminders(userId),
  });

  const createRuleMutation = useMutation({
    mutationFn: () => {
      const tag = mockTags.find(t => t.id === Number(selectedTag));
      return reminderApi.createRule(
        Number(selectedTag),
        tag?.name || '',
        condition as 'no_update' | 'no_activity' | 'low_rating',
        Number(threshold),
        message,
        userId
      );
    },
    onSuccess: () => {
      toast.success('Reminder rule created');
      setSelectedTag('');
    },
  });

  const evaluateMutation = useMutation({
    mutationFn: () => reminderApi.evaluateRules(userId),
    onSuccess: (count) => {
      queryClient.invalidateQueries({ queryKey: ['reminders'] });
      toast.success(`Generated ${count} new reminders`);
    },
  });

  const dismissMutation = useMutation({
    mutationFn: (reminderId: number) => reminderApi.dismissReminder(reminderId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reminders'] });
      toast.success('Reminder dismissed');
    },
  });

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Create Reminder Rule
          </CardTitle>
          <CardDescription>Set up automated reminders for tagged items</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Tag</Label>
            <Select value={selectedTag} onValueChange={setSelectedTag}>
              <SelectTrigger>
                <SelectValue placeholder="Select a tag" />
              </SelectTrigger>
              <SelectContent>
                {mockTags.map(tag => (
                  <SelectItem key={tag.id} value={String(tag.id)}>{tag.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Condition</Label>
            <Select value={condition} onValueChange={setCondition}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="no_update">No update for X days</SelectItem>
                <SelectItem value="no_activity">No activity for X days</SelectItem>
                <SelectItem value="low_rating">Rating below X</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Threshold</Label>
            <Input type="number" value={threshold} onChange={e => setThreshold(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Message</Label>
            <Textarea value={message} onChange={e => setMessage(e.target.value)} />
          </div>
          <div className="flex gap-2">
            <Button onClick={() => createRuleMutation.mutate()} disabled={!selectedTag}>
              <Plus className="w-4 h-4 mr-2" />
              Create Rule
            </Button>
            <Button variant="outline" onClick={() => evaluateMutation.mutate()}>
              <Play className="w-4 h-4 mr-2" />
              Evaluate Rules
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Active Reminders</CardTitle>
          <CardDescription>{reminders?.length || 0} pending</CardDescription>
        </CardHeader>
        <CardContent>
          {reminders?.length === 0 ? (
            <p className="text-muted-foreground">No active reminders</p>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {reminders?.map(reminder => (
                <div key={reminder.id} className="flex items-center justify-between p-2 border rounded">
                  <div>
                    <p className="font-medium text-sm">{reminder.itemTitle}</p>
                    <p className="text-xs text-muted-foreground">{reminder.message}</p>
                  </div>
                  <Button size="sm" variant="ghost" onClick={() => dismissMutation.mutate(reminder.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

// Analytics Tab
const AnalyticsTab = ({ userId }: { userId: number }) => {
  const { data: globalAnalytics, isLoading: globalLoading } = useQuery({
    queryKey: ['globalAnalytics'],
    queryFn: analyticsApi.getGlobalAnalytics,
  });

  const { data: userAnalytics, isLoading: userLoading } = useQuery({
    queryKey: ['userAnalytics', userId],
    queryFn: () => analyticsApi.getUserAnalytics(userId),
  });

  if (globalLoading || userLoading) return <p>Loading analytics...</p>;

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Items by Status</CardTitle>
        </CardHeader>
        <CardContent>
          {globalAnalytics?.itemsByStatus.map(stat => (
            <div key={stat.status} className="flex justify-between py-1">
              <span>{stat.status}</span>
              <Badge variant="secondary">{stat.count}</Badge>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Items by Category</CardTitle>
        </CardHeader>
        <CardContent>
          {globalAnalytics?.itemsByCategory.map(stat => (
            <div key={stat.category} className="flex justify-between py-1">
              <span>{stat.category}</span>
              <Badge variant="secondary">{stat.count}</Badge>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Popular Tags</CardTitle>
        </CardHeader>
        <CardContent>
          {globalAnalytics?.popularTags.slice(0, 5).map(stat => (
            <div key={stat.tag} className="flex justify-between py-1">
              <span>{stat.tag}</span>
              <Badge variant="secondary">{stat.count}</Badge>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Your Stats</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between"><span>Items Created</span><Badge>{userAnalytics?.itemsCreated}</Badge></div>
          <div className="flex justify-between"><span>Comments</span><Badge>{userAnalytics?.commentsPosted}</Badge></div>
          <div className="flex justify-between"><span>Likes Given</span><Badge>{userAnalytics?.likesGiven}</Badge></div>
          <div className="flex justify-between"><span>Bookmarks</span><Badge>{userAnalytics?.bookmarksCount}</Badge></div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Top Categories (Your Activity)</CardTitle>
        </CardHeader>
        <CardContent>
          {userAnalytics?.topCategories.map(cat => (
            <div key={cat.category} className="flex justify-between py-1">
              <span>{cat.category}</span>
              <Badge variant="outline">{cat.interactions}</Badge>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Versions per Item</CardTitle>
        </CardHeader>
        <CardContent>
          {globalAnalytics?.versionsPerItem.length === 0 ? (
            <p className="text-muted-foreground text-sm">No versions created yet</p>
          ) : (
            globalAnalytics?.versionsPerItem.map(item => (
              <div key={item.itemTitle} className="flex justify-between py-1">
                <span className="truncate max-w-[150px]">{item.itemTitle}</span>
                <Badge variant="secondary">{item.versions}</Badge>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
};

// Calendar Tab
const CalendarTab = ({ userId }: { userId: number }) => {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

  const { data: events } = useQuery({
    queryKey: ['calendarEvents'],
    queryFn: () => calendarApi.getEvents(userId),
  });

  const createEventMutation = useMutation({
    mutationFn: () => calendarApi.createEvent({
      title,
      description,
      startTime: new Date(startTime).toISOString(),
      endTime: new Date(endTime).toISOString(),
      source: 'internal',
    }, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendarEvents'] });
      toast.success('Event created');
      setTitle('');
      setDescription('');
      setStartTime('');
      setEndTime('');
    },
  });

  const syncMutation = useMutation({
    mutationFn: (service: 'google' | 'outlook') => calendarApi.syncCalendar(userId, service),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['calendarEvents'] });
      toast.success(`Synced ${result.synced} events`);
    },
  });

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Create Event
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Title</Label>
            <Input value={title} onChange={e => setTitle(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea value={description} onChange={e => setDescription(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Start</Label>
              <Input type="datetime-local" value={startTime} onChange={e => setStartTime(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>End</Label>
              <Input type="datetime-local" value={endTime} onChange={e => setEndTime(e.target.value)} />
            </div>
          </div>
          <Button onClick={() => createEventMutation.mutate()} disabled={!title || !startTime || !endTime}>
            <Plus className="w-4 h-4 mr-2" />
            Create Event
          </Button>
          <div className="border-t pt-4 flex gap-2">
            <Button variant="outline" onClick={() => syncMutation.mutate('google')}>
              Sync to Google
            </Button>
            <Button variant="outline" onClick={() => syncMutation.mutate('outlook')}>
              Sync to Outlook
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Events</CardTitle>
          <CardDescription>{events?.length || 0} events</CardDescription>
        </CardHeader>
        <CardContent>
          {events?.length === 0 ? (
            <p className="text-muted-foreground">No events</p>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {events?.map(event => (
                <div key={event.id} className="p-2 border rounded">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-sm">{event.title}</p>
                    {event.synced && <Badge variant="outline" className="text-xs">Synced</Badge>}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {new Date(event.startTime).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

// Filters Tab
const FiltersTab = ({ userId }: { userId: number }) => {
  const queryClient = useQueryClient();
  const [filterName, setFilterName] = useState('');
  const [field, setField] = useState('rating');
  const [operator, setOperator] = useState('gte');
  const [value, setValue] = useState('4');
  const [filteredItems, setFilteredItems] = useState<typeof mockItems>([]);

  const { data: savedFilters } = useQuery({
    queryKey: ['smartFilters'],
    queryFn: () => smartFilterApi.getUserFilters(userId),
  });

  const createFilterMutation = useMutation({
    mutationFn: () => smartFilterApi.createFilter(userId, filterName, [{ field, operator: operator as any, value: Number(value) }]),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['smartFilters'] });
      toast.success('Filter saved');
      setFilterName('');
    },
  });

  const applyFilter = async () => {
    const results = await smartFilterApi.applyFilter([{ field, operator: operator as any, value: Number(value) }]);
    setFilteredItems(results);
    toast.success(`Found ${results.length} items`);
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Smart Filter
          </CardTitle>
          <CardDescription>Create dynamic multi-condition filters</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-2">
            <div className="space-y-2">
              <Label>Field</Label>
              <Select value={field} onValueChange={setField}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="rating">Rating</SelectItem>
                  <SelectItem value="commentsCount">Comments</SelectItem>
                  <SelectItem value="categoryId">Category ID</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Operator</Label>
              <Select value={operator} onValueChange={setOperator}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="eq">Equals</SelectItem>
                  <SelectItem value="gt">Greater than</SelectItem>
                  <SelectItem value="gte">Greater or equal</SelectItem>
                  <SelectItem value="lt">Less than</SelectItem>
                  <SelectItem value="lte">Less or equal</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Value</Label>
              <Input value={value} onChange={e => setValue(e.target.value)} />
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={applyFilter}>
              <Play className="w-4 h-4 mr-2" />
              Apply Filter
            </Button>
          </div>
          <div className="border-t pt-4 space-y-2">
            <Label>Save Filter</Label>
            <div className="flex gap-2">
              <Input placeholder="Filter name" value={filterName} onChange={e => setFilterName(e.target.value)} />
              <Button variant="outline" onClick={() => createFilterMutation.mutate()} disabled={!filterName}>
                Save
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Results ({filteredItems.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredItems.length === 0 ? (
            <p className="text-muted-foreground">Apply a filter to see results</p>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {filteredItems.map(item => (
                <div key={item.id} className="p-2 border rounded">
                  <p className="font-medium text-sm">{item.title}</p>
                  <p className="text-xs text-muted-foreground">
                    Rating: {item.rating} • Comments: {item.commentsCount}
                  </p>
                </div>
              ))}
            </div>
          )}
          {savedFilters && savedFilters.length > 0 && (
            <div className="border-t mt-4 pt-4">
              <p className="text-sm font-medium mb-2">Saved Filters</p>
              <div className="flex flex-wrap gap-2">
                {savedFilters.map(filter => (
                  <Badge key={filter.id} variant="outline">{filter.name}</Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

// Notifications Tab
const NotificationsTab = ({ userId }: { userId: number }) => {
  const queryClient = useQueryClient();
  const [templateName, setTemplateName] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [channel, setChannel] = useState<'email' | 'internal' | 'both'>('internal');

  const { data: templates } = useQuery({
    queryKey: ['notificationTemplates'],
    queryFn: notificationApi.getTemplates,
  });

  const { data: notifications } = useQuery({
    queryKey: ['notifications', userId],
    queryFn: () => notificationApi.getUserNotifications(userId),
  });

  const createTemplateMutation = useMutation({
    mutationFn: () => notificationApi.createTemplate({
      name: templateName,
      subject,
      body,
      variables: body.match(/{{(\w+)}}/g) || [],
      channel,
      createdBy: userId,
    }, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notificationTemplates'] });
      toast.success('Template created');
      setTemplateName('');
      setSubject('');
      setBody('');
    },
  });

  const sendMutation = useMutation({
    mutationFn: (templateId: number) => notificationApi.sendNotification(templateId, userId, { userName: 'User', itemTitle: 'Test Item' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', userId] });
      toast.success('Notification sent');
    },
  });

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Create Template
          </CardTitle>
          <CardDescription>Use &#123;&#123;variable&#125;&#125; for dynamic content</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Template Name</Label>
            <Input value={templateName} onChange={e => setTemplateName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Subject</Label>
            <Input value={subject} onChange={e => setSubject(e.target.value)} placeholder="Hello {{userName}}" />
          </div>
          <div className="space-y-2">
            <Label>Body</Label>
            <Textarea value={body} onChange={e => setBody(e.target.value)} placeholder="Your item {{itemTitle}} has been updated." />
          </div>
          <div className="space-y-2">
            <Label>Channel</Label>
            <Select value={channel} onValueChange={(v) => setChannel(v as any)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="internal">Internal</SelectItem>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="both">Both</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={() => createTemplateMutation.mutate()} disabled={!templateName || !subject || !body}>
            <Plus className="w-4 h-4 mr-2" />
            Create Template
          </Button>
        </CardContent>
      </Card>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Templates</CardTitle>
          </CardHeader>
          <CardContent>
            {templates?.length === 0 ? (
              <p className="text-muted-foreground">No templates</p>
            ) : (
              <div className="space-y-2">
                {templates?.map(template => (
                  <div key={template.id} className="flex items-center justify-between p-2 border rounded">
                    <div>
                      <p className="font-medium text-sm">{template.name}</p>
                      <p className="text-xs text-muted-foreground">{template.channel}</p>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => sendMutation.mutate(template.id)}>
                      Send Test
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Notifications</CardTitle>
          </CardHeader>
          <CardContent>
            {notifications?.length === 0 ? (
              <p className="text-muted-foreground">No notifications</p>
            ) : (
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {notifications?.slice(0, 5).map(notif => (
                  <div key={notif.id} className="p-2 border rounded">
                    <p className="font-medium text-sm">{notif.title}</p>
                    <p className="text-xs text-muted-foreground">{notif.status}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Usage Tab
const UsageTab = () => {
  const { data: usage, isLoading } = useQuery({
    queryKey: ['usageAnalytics'],
    queryFn: usageAnalyticsApi.getUsageAnalytics,
  });

  if (isLoading) return <p>Loading usage analytics...</p>;

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Overall Usage</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between"><span>Total Sessions</span><Badge>{usage?.totalSessions}</Badge></div>
          <div className="flex justify-between"><span>Avg Duration</span><Badge>{usage?.averageSessionDuration} min</Badge></div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Function Usage</CardTitle>
        </CardHeader>
        <CardContent>
          {usage?.functionUsage.slice(0, 5).map(fn => (
            <div key={fn.function} className="flex justify-between py-1">
              <span className="text-xs truncate max-w-[150px]">{fn.function}</span>
              <Badge variant="outline" className="text-xs">{fn.calls}</Badge>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Item Activity</CardTitle>
        </CardHeader>
        <CardContent>
          {usage?.itemActivityStats.map(item => (
            <div key={item.itemId} className="flex justify-between py-1">
              <span className="text-xs truncate max-w-[120px]">{item.title}</span>
              <div className="flex gap-1">
                <Badge variant="secondary" className="text-xs">{item.views} views</Badge>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

// Integrations Tab
const IntegrationsTab = ({ userId }: { userId: number }) => {
  const queryClient = useQueryClient();
  const [webhookUrl, setWebhookUrl] = useState('');
  const [selectedService, setSelectedService] = useState<'zapier' | 'ifttt'>('zapier');

  const { data: integrations } = useQuery({
    queryKey: ['integrations', userId],
    queryFn: () => integrationApi.getUserIntegrations(userId),
  });

  const connectMutation = useMutation({
    mutationFn: () => integrationApi.connectService(userId, selectedService, webhookUrl),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integrations', userId] });
      toast.success(`Connected to ${selectedService}`);
      setWebhookUrl('');
    },
  });

  const triggerMutation = useMutation({
    mutationFn: (service: 'zapier' | 'ifttt') => integrationApi.triggerAction(userId, service, { event: 'test', timestamp: new Date().toISOString() }),
    onSuccess: (result) => {
      toast.success(result.message);
    },
  });

  const disconnectMutation = useMutation({
    mutationFn: (service: 'zapier' | 'ifttt') => integrationApi.disconnectService(userId, service),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integrations', userId] });
      toast.success('Disconnected');
    },
  });

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Connect Service
          </CardTitle>
          <CardDescription>Integrate with Zapier or IFTTT</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Service</Label>
            <Select value={selectedService} onValueChange={(v) => setSelectedService(v as any)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="zapier">Zapier</SelectItem>
                <SelectItem value="ifttt">IFTTT</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Webhook URL</Label>
            <Input value={webhookUrl} onChange={e => setWebhookUrl(e.target.value)} placeholder="https://hooks.zapier.com/..." />
          </div>
          <Button onClick={() => connectMutation.mutate()} disabled={!webhookUrl}>
            <Zap className="w-4 h-4 mr-2" />
            Connect
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Connected Services</CardTitle>
          <CardDescription>{integrations?.length || 0} connected</CardDescription>
        </CardHeader>
        <CardContent>
          {integrations?.length === 0 ? (
            <p className="text-muted-foreground">No services connected</p>
          ) : (
            <div className="space-y-2">
              {integrations?.map(int => (
                <div key={int.id} className="flex items-center justify-between p-2 border rounded">
                  <div>
                    <p className="font-medium text-sm capitalize">{int.service}</p>
                    <p className="text-xs text-muted-foreground">{int.status}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => triggerMutation.mutate(int.service as any)}>
                      <Play className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => disconnectMutation.mutate(int.service as any)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

// Backups Tab
const BackupsTab = ({ userId }: { userId: number }) => {
  const queryClient = useQueryClient();
  const [archiveName, setArchiveName] = useState('');
  const [selectedItems, setSelectedItems] = useState<number[]>([]);

  const { data: archives } = useQuery({
    queryKey: ['projectArchives', userId],
    queryFn: () => projectArchiveApi.getArchives(userId),
  });

  const createArchiveMutation = useMutation({
    mutationFn: () => projectArchiveApi.createArchive(userId, archiveName, selectedItems.length > 0 ? selectedItems : mockItems.map(i => i.id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projectArchives', userId] });
      toast.success('Archive created');
      setArchiveName('');
      setSelectedItems([]);
    },
  });

  const restoreMutation = useMutation({
    mutationFn: (archiveId: number) => projectArchiveApi.restoreArchive(archiveId, userId),
    onSuccess: (result) => {
      toast.success(`Restored ${result.restored} items`);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (archiveId: number) => projectArchiveApi.deleteArchive(archiveId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projectArchives', userId] });
      toast.success('Archive deleted');
    },
  });

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FolderArchive className="w-5 h-5" />
            Create Backup
          </CardTitle>
          <CardDescription>Archive your project data</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Archive Name</Label>
            <Input value={archiveName} onChange={e => setArchiveName(e.target.value)} placeholder="My Backup" />
          </div>
          <div className="space-y-2">
            <Label>Items to Include</Label>
            <p className="text-xs text-muted-foreground">Leave empty to backup all items</p>
            <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
              {mockItems.map(item => (
                <Badge 
                  key={item.id} 
                  variant={selectedItems.includes(item.id) ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => {
                    setSelectedItems(prev => 
                      prev.includes(item.id) 
                        ? prev.filter(id => id !== item.id) 
                        : [...prev, item.id]
                    );
                  }}
                >
                  {item.title.slice(0, 20)}...
                </Badge>
              ))}
            </div>
          </div>
          <Button onClick={() => createArchiveMutation.mutate()} disabled={!archiveName}>
            <FolderArchive className="w-4 h-4 mr-2" />
            Create Backup
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Backups</CardTitle>
          <CardDescription>{archives?.length || 0} archives</CardDescription>
        </CardHeader>
        <CardContent>
          {archives?.length === 0 ? (
            <p className="text-muted-foreground">No backups</p>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {archives?.map(archive => (
                <div key={archive.id} className="flex items-center justify-between p-2 border rounded">
                  <div>
                    <p className="font-medium text-sm">{archive.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {archive.itemIds.length} items • {(archive.size / 1024).toFixed(1)} KB • {new Date(archive.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => restoreMutation.mutate(archive.id)}>
                      <RefreshCw className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => deleteMutation.mutate(archive.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdvancedFeatures;
