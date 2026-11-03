export interface NavItem {
  label: string;
  path: string;
  icon: string;
}

export const NAV_ITEMS: NavItem[] = [
  { label: 'Inicio', path: '/inicio', icon: 'home' },
  { label: 'Productos', path: '/productos', icon: 'inventory_2' },
  { label: 'Inventario', path: '/inventario', icon: 'warehouse' },
  { label: 'Ventas', path: '/ventas', icon: 'point_of_sale' },
  { label: 'Clientes', path: '/clientes', icon: 'people' },
  { label: 'Reportes', path: '/reportes', icon: 'bar_chart' },
  { label: 'Configuración', path: '/configuracion', icon: 'settings' },
];
