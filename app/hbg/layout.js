export const metadata = {
  title: 'Her Body Goals · CleanEats',
  description: '3-day Zambian fuel plan for Her Body Goals Zambia competitors.',
}

export default function HbgLayout({ children }) {
  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Anybody:wght@600;700;800&family=Space+Mono:wght@400;500&display=swap"
        rel="stylesheet"
      />
      {children}
    </>
  )
}
