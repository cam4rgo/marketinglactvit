
import { useState } from "react";
import { 
  LayoutDashboard, 
  DollarSign, 
  Megaphone, 
  Settings, 
  CheckSquare, 
  Users, 
  Briefcase,
  Factory,
  Link2,
  Calendar,
  ChevronDown,
  ChevronUp,
  LogOut,
  User
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import { useUserModuleAccess } from "@/hooks/useModulePermissions";
import { useCompanySettings } from "@/hooks/useCompanySettings";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useIsMobile } from "@/hooks/use-mobile";

const modules = [
  { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
  { id: 'financial', name: 'Financeiro', icon: DollarSign, path: '/financial' },
  { id: 'campaigns', name: 'Campanhas', icon: Megaphone, path: '/campaigns' },
  { id: 'approvals', name: 'Aprovações', icon: CheckSquare, path: '/approvals' },
  { id: 'comercial', name: 'Comercial', icon: Briefcase, path: '/comercial' },
  { id: 'processing_units', name: 'Unidades', icon: Factory, path: '/processing-units' },
  { id: 'commemorative_dates', name: 'Calendário', icon: Calendar, path: '/commemorative-dates' },
];

const adminModules = [
  { id: 'users', name: 'Usuários', icon: Users, path: '/users' },
  { id: 'integrations', name: 'Integrações', icon: Link2, path: '/integrations' },
  { id: 'settings', name: 'Configurações', icon: Settings, path: '/settings' },
];

export function AppSidebar() {
  const { state, setOpenMobile } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const { user, signOut } = useAuth();
  const { data: moduleAccess = {} } = useUserModuleAccess();
  const { data: companySettings } = useCompanySettings();
  const { data: userProfile } = useUserProfile();
  const [isExpanded, setIsExpanded] = useState(true);
  const [isAdminExpanded, setIsAdminExpanded] = useState(true);
  const isMobile = useIsMobile();

  const currentPath = location.pathname;

  const isActive = (path: string) => {
    if (path === '/dashboard' && currentPath === '/dashboard') return true;
    if (path !== '/dashboard' && currentPath.startsWith(path)) return true;
    return false;
  };

  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive 
      ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium hover:bg-sidebar-accent hover:text-sidebar-accent-foreground" 
      : "hover:bg-sidebar-accent/50 text-sidebar-foreground hover:text-sidebar-accent-foreground";

  // Função para fechar a sidebar no mobile quando um link for clicado
  const handleNavClick = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  // Filter modules based on access permissions
  const accessibleModules = modules.filter(module => {
    // If module access is not defined, allow access by default
    if (moduleAccess[module.id] === undefined) return true;
    return moduleAccess[module.id];
  });

  const accessibleAdminModules = adminModules.filter(module => {
    // Admin modules are always accessible if user has admin access
    return moduleAccess[module.id] !== false;
  });

  const hasAdminAccess = accessibleAdminModules.length > 0;

  // Get user display name and email
  const displayName = userProfile?.full_name || user?.email?.split('@')[0] || 'Usuário';
  const displayEmail = user?.email || '';
  const avatarUrl = userProfile?.avatar_url;

  return (
    <Sidebar className={collapsed ? "w-14" : "w-60"} collapsible="icon">
      {/* Header com logo/nome da empresa */}
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-3 p-4">
          {companySettings?.logo_url && !collapsed && (
            <img 
              src={companySettings.logo_url} 
              alt={companySettings.company_name || "Logo"} 
              className="w-8 h-8 object-contain"
            />
          )}
          {!collapsed && (
            <div className="flex flex-col min-w-0 flex-1">
              <span className="font-semibold text-sidebar-foreground truncate">
                {companySettings?.company_name || "Marketing System"}
              </span>
              {companySettings?.description && (
                <span className="text-xs text-sidebar-foreground/70 truncate">
                  {companySettings.description}
                </span>
              )}
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        {/* Main Modules */}
        <SidebarGroup>
          <div 
            className="flex items-center justify-between cursor-pointer py-2 hover:bg-sidebar-accent/30 rounded-md mx-2"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {!collapsed && (
              <>
                <SidebarGroupLabel>Módulos Principais</SidebarGroupLabel>
                {isExpanded ? (
                  <ChevronUp className="w-4 h-4 mr-4 text-sidebar-foreground/70" />
                ) : (
                  <ChevronDown className="w-4 h-4 mr-4 text-sidebar-foreground/70" />
                )}
              </>
            )}
          </div>
          
          {(collapsed || isExpanded) && (
            <SidebarGroupContent>
              <SidebarMenu>
                {accessibleModules.map((item) => (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton asChild>
                      <NavLink 
                        to={item.path} 
                        end 
                        className={getNavCls}
                        onClick={handleNavClick}
                      >
                        <item.icon className="w-4 h-4" />
                        {!collapsed && <span>{item.name}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          )}
        </SidebarGroup>

        {/* Admin Modules */}
        {hasAdminAccess && (
          <SidebarGroup>
            <div 
              className="flex items-center justify-between cursor-pointer py-2 hover:bg-sidebar-accent/30 rounded-md mx-2"
              onClick={() => setIsAdminExpanded(!isAdminExpanded)}
            >
              {!collapsed && (
                <>
                  <SidebarGroupLabel>Administração</SidebarGroupLabel>
                  {isAdminExpanded ? (
                    <ChevronUp className="w-4 h-4 mr-4 text-sidebar-foreground/70" />
                  ) : (
                    <ChevronDown className="w-4 h-4 mr-4 text-sidebar-foreground/70" />
                  )}
                </>
              )}
            </div>
            
            {(collapsed || isAdminExpanded) && (
              <SidebarGroupContent>
                <SidebarMenu>
                  {accessibleAdminModules.map((item) => (
                    <SidebarMenuItem key={item.id}>
                      <SidebarMenuButton asChild>
                        <NavLink 
                          to={item.path} 
                          end 
                          className={getNavCls}
                          onClick={handleNavClick}
                        >
                          <item.icon className="w-4 h-4" />
                          {!collapsed && <span>{item.name}</span>}
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            )}
          </SidebarGroup>
        )}
      </SidebarContent>

      {/* Footer with user info */}
      <SidebarFooter className="border-t border-sidebar-border p-0">
        <div className={`flex items-center ${collapsed ? 'justify-center p-2' : 'gap-3 p-4'}`}>
          <Avatar className="w-8 h-8 flex-shrink-0">
            {avatarUrl ? (
              <AvatarImage src={avatarUrl} alt={displayName} />
            ) : null}
            <AvatarFallback className="bg-primary/10 text-primary">
              <User className="w-4 h-4" />
            </AvatarFallback>
          </Avatar>
          {!collapsed && (
            <div className="flex-1 flex items-center justify-between min-w-0">
              <div className="flex flex-col min-w-0 flex-1 pr-2">
                <span className="text-sm font-medium text-sidebar-foreground truncate">
                  {displayName}
                </span>
                <span className="text-xs text-sidebar-foreground/70 truncate">
                  {displayEmail}
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={signOut}
                className="p-2 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground flex-shrink-0"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
