import { AppBar, Box, Container, Toolbar, Typography } from '@mui/material'
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
    <AppBar position="sticky" color="primary" elevation={0}>
      <Container maxWidth="xl">
        <Toolbar disableGutters sx={{ gap: 1 }}>
          <Typography
            variant="h6"
            component={RouterLink}
            to="/"
            sx={{ color: 'inherit', textDecoration: 'none', mr: 4, letterSpacing: 0.5 }}
          >
            Lab<Box component="span" sx={{ fontWeight: 400 }}>Efficient</Box>
          </Typography>

          {NAV_ITEMS.map(item => (
            <Box
              key={item.path}
              component={RouterLink}
              to={item.path}
              sx={{
                px: 1.5,
                py: 0.75,
                borderRadius: 1,
                color: 'inherit',
                textDecoration: 'none',
                fontSize: '0.875rem',
                fontWeight: isActive(item.path) ? 700 : 500,
                bgcolor: isActive(item.path) ? 'rgba(255,255,255,0.18)' : 'transparent',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.12)' },
                transition: 'background-color 0.2s',
              }}
            >
              {item.label}
            </Box>
          ))}
        </Toolbar>
      </Container>
    </AppBar>
  )
}
