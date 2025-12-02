import { useState, useEffect } from 'react';
import { groupsService, Group } from '../services/groupsService';

export const useGroups = (isLoggedIn: boolean) => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(false);
  const [groupSessions, setGroupSessions] = useState<Record<number, any[]>>({});

  const loadGroups = async () => {
    if (!isLoggedIn) {
      const localGroups = localStorage.getItem('local_groups');
      if (localGroups) {
        try {
          const parsed = JSON.parse(localGroups);
          setGroups(parsed.map((g: any) => ({
            ...g,
            id: typeof g.id === 'string' ? parseInt(g.id) || Date.now() : g.id
          })));
        } catch {
          setGroups([]);
        }
      }
      return;
    }

    setLoading(true);
    try {
      const userGroups = await groupsService.getGroups();
      setGroups(userGroups);
    } catch (error) {
      console.error('Failed to load groups:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGroups();
  }, [isLoggedIn]);


  const createGroup = async (name: string): Promise<Group | null> => {
    if (!isLoggedIn) {
      const newGroup: Group = {
        id: Date.now(),
        name: name,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        user_id: 'guest',
      };
      setGroups(prev => [...prev, newGroup]);
      localStorage.setItem('local_groups', JSON.stringify([...groups, newGroup]));
      return newGroup;
    }

    try {
      const group = await groupsService.createGroup(name);
      setGroups(prev => [...prev, group]);
      return group;
    } catch (error) {
      console.error('Failed to create group:', error);
      return null;
    }
  };

  const deleteGroup = async (groupId: number): Promise<boolean> => {
    if (!isLoggedIn) {
      setGroups(prev => prev.filter(g => g.id !== groupId));
      localStorage.setItem('local_groups', JSON.stringify(groups.filter(g => g.id !== groupId)));
      return true;
    }

    try {
      await groupsService.deleteGroup(groupId);
      setGroups(prev => prev.filter(g => g.id !== groupId));
      return true;
    } catch (error) {
      console.error('Failed to delete group:', error);
      return false;
    }
  };

  const updateGroup = async (groupId: number, name: string): Promise<boolean> => {
    if (!isLoggedIn) {
      setGroups(prev => prev.map(g => g.id === groupId ? { ...g, name, updated_at: new Date().toISOString() } : g));
      const updated = groups.map(g => g.id === groupId ? { ...g, name, updated_at: new Date().toISOString() } : g);
      localStorage.setItem('local_groups', JSON.stringify(updated));
      return true;
    }

    try {
      const group = await groupsService.updateGroup(groupId, name);
      setGroups(prev => prev.map(g => g.id === groupId ? group : g));
      return true;
    } catch (error) {
      console.error('Failed to update group:', error);
      return false;
    }
  };

  const loadGroupSessions = async (groupId: number) => {
    if (!isLoggedIn) {
      return [];
    }

    try {
      const sessions = await groupsService.getGroupSessions(groupId);
      setGroupSessions(prev => ({ ...prev, [groupId]: sessions }));
      return sessions;
    } catch (error) {
      console.error('Failed to load group sessions:', error);
      return [];
    }
  };

  const addSessionToGroup = async (sessionId: number, groupId: number): Promise<boolean> => {
    if (!isLoggedIn) {
      return false;
    }

    try {
      await groupsService.addSessionToGroup(sessionId, groupId);
      if (groupSessions[groupId]) {
        await loadGroupSessions(groupId);
      }
      return true;
    } catch (error) {
      console.error('Failed to add session to group:', error);
      return false;
    }
  };

  const removeSessionFromGroup = async (sessionId: number, groupId: number): Promise<boolean> => {
    if (!isLoggedIn) {
      return false;
    }

    try {
      await groupsService.removeSessionFromGroup(sessionId, groupId);
      if (groupSessions[groupId]) {
        await loadGroupSessions(groupId);
      }
      return true;
    } catch (error) {
      console.error('Failed to remove session from group:', error);
      return false;
    }
  };

  const ungroupSession = async (sessionId: number): Promise<boolean> => {
    if (!isLoggedIn) {
      return false;
    }

    try {
      await groupsService.removeSessionFromAllGroups(sessionId);
      // Reload all expanded groups to remove the session from their previews
      Object.keys(groupSessions).forEach(async (gId) => {
        await loadGroupSessions(parseInt(gId));
      });
      return true;
    } catch (error) {
      console.error('Failed to ungroup session:', error);
      return false;
    }
  };

  return {
    groups,
    loading,
    groupSessions,
    createGroup,
    deleteGroup,
    updateGroup,
    loadGroupSessions,
    addSessionToGroup,
    removeSessionFromGroup,
    ungroupSession,
    refreshGroups: loadGroups,
  };
};
