export const metadata = {
  title: 'Oferta Especial',
  description: 'Aproveite esta oportunidade única.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body style={{ margin: 0, padding: 0, fontFamily: 'sans-serif', backgroundColor: '#f4f4f4' }}>
        {children}
      </body>
    </html>
  )
}
