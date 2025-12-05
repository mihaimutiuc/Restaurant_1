const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

const testimonials = [
  {
    name: "Maria Ionescu",
    role: "Client fidel de 3 ani",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face",
    rating: 5,
    text: "Cel mai bun restaurant din oraș! Sarmalele sunt absolut delicioase, exact ca la bunica. Recomand cu căldură tuturor prietenilor mei!",
    date: new Date("2024-11-15"),
    verified: true,
    order: 1
  },
  {
    name: "Andrei Popa",
    role: "Food Blogger",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    rating: 5,
    text: "Am fost impresionat de calitatea preparatelor și de atenția la detalii. Ciorbă de burtă extraordinară! Voi reveni cu siguranță.",
    date: new Date("2024-10-28"),
    verified: true,
    order: 2
  },
  {
    name: "Elena Dumitrescu",
    role: "Client",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
    rating: 5,
    text: "Livrarea a fost rapidă și mâncarea a ajuns caldă. Papanașii sunt cei mai buni pe care i-am mâncat vreodată!",
    date: new Date("2024-11-02"),
    verified: true,
    order: 3
  },
  {
    name: "Mihai Georgescu",
    role: "Antreprenor",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    rating: 5,
    text: "Meniu variat și prețuri corecte. Personalul foarte amabil și profesionist. Locul perfect pentru întâlniri de afaceri!",
    date: new Date("2024-09-20"),
    verified: true,
    order: 4
  },
  {
    name: "Ana Marinescu",
    role: "Client fidel",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face",
    rating: 5,
    text: "Comandăm de aici de ani de zile și calitatea este mereu constantă. Mulțumim pentru mâncarea delicioasă!",
    date: new Date("2024-11-10"),
    verified: true,
    order: 5
  },
  {
    name: "Cristian Radu",
    role: "Chef Hobby",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
    rating: 5,
    text: "Ca și bucătar amator, apreciez enorm calitatea ingredientelor. Atmosferă plăcută și servicii impecabile!",
    date: new Date("2024-10-05"),
    verified: true,
    order: 6
  }
]

async function main() {
  console.log('🌱 Seeding testimonials...')

  // Șterge testimonialele existente
  await prisma.testimonial.deleteMany()
  console.log('✓ Cleared existing testimonials')

  // Adaugă testimonialele noi
  for (const testimonial of testimonials) {
    await prisma.testimonial.create({
      data: testimonial
    })
    console.log(`✓ Added testimonial from ${testimonial.name}`)
  }

  console.log(`\n✅ Successfully seeded ${testimonials.length} testimonials!`)
}

main()
  .catch((e) => {
    console.error('Error seeding testimonials:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
