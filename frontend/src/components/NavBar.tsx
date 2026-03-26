import { AppBar, Button, Toolbar, Typography } from '@mui/material'
import { Link as RouterLink, useLocation } from 'react-router-dom'

const NAV_ITEMS = [
  { label: 'Import',    path: '/' },
  { label: 'Prüfung',   path: '/review' },
  { label: 'Befunde',   path: '/befunde' },
  { label: 'Patienten', path: '/patienten' },
]

export function NavBar() {
  const location = useLocation()

  const isActive = (path: string) =>
    path === '/'
      ? location.pathname === '/'
      : location.pathname.startsWith(path)

  return (
    <AppBar position="static" color="primary">
      <Toolbar>
        <Typography variant="h6" sx={{ mr: 4 }}>LabEfficient</Typography>
        {NAV_ITEMS.map(item => (
          <Button
            key={item.path}
            component={RouterLink}
            to={item.path}
            color="inherit"
            sx={{
              fontWeight: isActive(item.path) ? 'bold' : 'normal',
              borderBottom: isActive(item.path) ? '2px solid white' : '2px solid transparent',
              borderRadius: 0,
            }}
          >
            {item.label}
          </Button>
        ))}
      </Toolbar>
    </AppBar>
  )
}
