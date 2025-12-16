const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

const categories = [
  { slug: "all", name: "Toate", icon: "🍽️", order: 0 },
  { slug: "appetizers", name: "Aperitive", icon: "🥗", order: 1 },
  { slug: "main", name: "Fel Principal", icon: "🍖", order: 2 },
  { slug: "soups", name: "Supe & Ciorbe", icon: "🍲", order: 3 },
  { slug: "desserts", name: "Deserturi", icon: "🧁", order: 4 },
  { slug: "drinks", name: "Băuturi", icon: "🥤", order: 5 }
]

const products = [
  {
    productId: 1,
    name: "Ciorbă de burtă",
    description: "Ciorbă tradițională românească cu smântână și ardei iute",
    longDescription: "Ciorbă de burtă preparată după rețeta tradițională românească, cu burtă de vită fiartă ore întregi până devine fragedă. Servită cu smântână proaspătă, usturoi pisat și ardei iute la alegere. Un deliciu pentru gurmanzi!",
    price: 3.60,
    image: "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800&q=80",
    categorySlug: "soups",
    isPopular: true,
    isNew: false,
    ingredients: ["burtă de vită", "smântână", "usturoi", "oțet", "ardei iute"],
    allergens: ["lactoză"],
    preparationTime: 15,
    displayTime: "15 min",
    calories: 320
  },
  {
    productId: 2,
    name: "Sarmale în foi de viță",
    description: "Sarmale tradiționale cu carne de porc și orez, servite cu mămăligă și smântână",
    longDescription: "Sarmalele noastre sunt preparate manual, cu carne de porc tocată și orez, învelite în foi de viță fragede. Fierte lent timp de ore întregi în sos de roșii cu cimbru. Servite cu mămăligă caldă și smântână de casă.",
    price: 6.40,
    image: "https://images.unsplash.com/photo-1625944230945-1b7dd3b949ab?w=800&q=80",
    categorySlug: "main",
    isPopular: true,
    isNew: false,
    ingredients: ["carne de porc", "orez", "foi de viță", "ceapă", "roșii", "cimbru"],
    allergens: [],
    preparationTime: 25,
    displayTime: "25 min",
    calories: 580
  },
  {
    productId: 3,
    name: "Mici cu muștar",
    description: "10 mici la grătar serviți cu muștar și pâine proaspătă",
    longDescription: "Micii noștri sunt preparați după rețeta tradițională, cu carne de vită și porc, condimentați cu usturoi, cimbru și bicarbonat. Rumeniți perfect la grătar și serviți cu muștar de casă și pâine proaspătă.",
    price: 5.60,
    image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&q=80",
    categorySlug: "main",
    isPopular: true,
    isNew: false,
    ingredients: ["carne de vită", "carne de porc", "usturoi", "cimbru", "bicarbonat"],
    allergens: [],
    preparationTime: 20,
    displayTime: "20 min",
    calories: 650
  },
  {
    productId: 4,
    name: "Salată de vinete",
    description: "Salată de vinete coapte pe jar cu ceapă și roșii",
    longDescription: "Vinete românești coapte pe jar până capătă acea aromă afumată specifică. Tocate fin și amestecate cu ulei de floarea soarelui, ceapă proaspătă și sare. Servite cu roșii feliate și pâine prăjită.",
    price: 3.00,
    image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800&q=80",
    categorySlug: "appetizers",
    isPopular: false,
    isNew: false,
    ingredients: ["vinete", "ceapă", "ulei", "sare", "roșii"],
    allergens: [],
    preparationTime: 10,
    displayTime: "10 min",
    calories: 180
  },
  {
    productId: 5,
    name: "Zacuscă de casă",
    description: "Zacuscă făcută în casă cu vinete, ardei și roșii",
    longDescription: "Zacuscă preparată după rețeta bunicii, cu vinete coapte, ardei copți, ceapă călită și pastă de roșii. Fiartă lent ore întregi pentru a obține acea consistență perfectă. Ideală cu pâine proaspătă.",
    price: 2.80,
    image: "https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=800&q=80",
    categorySlug: "appetizers",
    isPopular: false,
    isNew: true,
    ingredients: ["vinete", "ardei copți", "ceapă", "roșii", "ulei"],
    allergens: [],
    preparationTime: 10,
    displayTime: "10 min",
    calories: 150
  },
  {
    productId: 6,
    name: "Papanași cu smântână",
    description: "Papanași pufoși cu smântână și dulceață de afine",
    longDescription: "Papanași tradiționali românești, pufoși și aurii, preparați din brânză de vaci proaspătă. Serviți fierbinți cu smântână groasă și dulceață de afine de casă. Un desert care te transportă în copilărie!",
    price: 4.40,
    image: "https://images.unsplash.com/photo-1551024506-0bccd828d307?w=800&q=80",
    categorySlug: "desserts",
    isPopular: true,
    isNew: false,
    ingredients: ["brânză de vaci", "ouă", "făină", "smântână", "dulceață de afine"],
    allergens: ["lactoză", "gluten", "ouă"],
    preparationTime: 15,
    displayTime: "15 min",
    calories: 420
  },
  {
    productId: 7,
    name: "Cozonac tradițional",
    description: "Felie de cozonac cu nucă și rahat",
    longDescription: "Cozonac pufos și aromat, preparat după rețeta tradițională cu aluat dospit natural. Umplut cu nucă măcinată și rahat turcesc. Perfect pentru a încheia o masă festivă sau pentru o gustare dulce.",
    price: 2.40,
    image: "https://images.unsplash.com/photo-1509365465985-25d11c17e812?w=800&q=80",
    categorySlug: "desserts",
    isPopular: false,
    isNew: false,
    ingredients: ["făină", "ouă", "unt", "zahăr", "nucă", "rahat"],
    allergens: ["gluten", "lactoză", "ouă", "nuci"],
    preparationTime: 5,
    displayTime: "5 min",
    calories: 350
  },
  {
    productId: 8,
    name: "Ciorbă de perișoare",
    description: "Ciorbă acră cu perișoare de carne și legume",
    longDescription: "Ciorbă tradițională cu perișoare fragede din carne de porc și vită, în supă acrită cu borș. Plină de legume proaspete: morcov, pătrunjel, țelină și leuștean. O explozie de arome românești!",
    price: 3.20,
    image: "https://images.unsplash.com/photo-1603105037880-880cd4edfb0d?w=800&q=80",
    categorySlug: "soups",
    isPopular: false,
    isNew: false,
    ingredients: ["carne tocată", "orez", "morcov", "pătrunjel", "țelină", "borș"],
    allergens: [],
    preparationTime: 15,
    displayTime: "15 min",
    calories: 280
  },
  {
    productId: 9,
    name: "Mușchi de vită la grătar",
    description: "Mușchi de vită premium la grătar cu garnitură de legume",
    longDescription: "Mușchi de vită Black Angus maturat 28 de zile, gătit la perfecțiune pe grătarul cu cărbuni. Servit cu legume la grătar, sos chimichurri și cartofi copți. Pentru iubitorii de carne de calitate!",
    price: 11.00,
    image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&q=80",
    categorySlug: "main",
    isPopular: false,
    isNew: true,
    ingredients: ["mușchi de vită", "legume", "chimichurri", "cartofi", "condimente"],
    allergens: [],
    preparationTime: 30,
    displayTime: "30 min",
    calories: 720
  },
  {
    productId: 10,
    name: "Limonadă de casă",
    description: "Limonadă răcoritoare cu mentă și lămâie proaspătă",
    longDescription: "Limonadă preparată zilnic din lămâi proaspete, apă minerală și sirop de zahăr de casă. Aromatizată cu frunze de mentă și servită cu gheață. Perfectă pentru zilele călduroase!",
    price: 2.40,
    image: "https://images.unsplash.com/photo-1621263764928-df1444c5e859?w=800&q=80",
    categorySlug: "drinks",
    isPopular: false,
    isNew: false,
    ingredients: ["lămâi", "apă minerală", "zahăr", "mentă", "gheață"],
    allergens: [],
    preparationTime: 5,
    displayTime: "5 min",
    calories: 80
  },
  {
    productId: 11,
    name: "Vin roșu de casă",
    description: "Pahar de vin roșu de casă, 200ml",
    longDescription: "Vin roșu sec din struguri Fetească Neagră, produs în crama noastră parteneră din Dealu Mare. Arome de fructe de pădure și vanilie, cu un final lung și catifelat.",
    price: 3.60,
    image: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=800&q=80",
    categorySlug: "drinks",
    isPopular: false,
    isNew: false,
    ingredients: ["struguri Fetească Neagră"],
    allergens: ["sulfiți"],
    preparationTime: 2,
    displayTime: "2 min",
    calories: 160
  },
  {
    productId: 12,
    name: "Platou aperitive",
    description: "Platou cu brânzeturi, mezeluri și legume proaspete",
    longDescription: "Platou generos cu selecție de brânzeturi românești (telemea, cașcaval, brânză de burduf), mezeluri artizanale (salam de Sibiu, pastramă), măsline, roșii cherry și pâine de casă.",
    price: 9.00,
    image: "https://images.unsplash.com/photo-1626200419199-391ae4be7a41?w=800&q=80",
    categorySlug: "appetizers",
    isPopular: true,
    isNew: false,
    ingredients: ["brânzeturi", "mezeluri", "măsline", "roșii", "pâine"],
    allergens: ["lactoză", "gluten"],
    preparationTime: 10,
    displayTime: "10 min",
    calories: 520
  }
]

async function main() {
  console.log('🌱 Începe seed-ul bazei de date...')

  // Șterge datele existente
  console.log('🗑️ Șterg produsele existente...')
  await prisma.product.deleteMany()
  
  console.log('🗑️ Șterg categoriile existente...')
  await prisma.category.deleteMany()

  // Creează categoriile
  console.log('📁 Creez categoriile...')
  const createdCategories = {}
  
  for (const category of categories) {
    const created = await prisma.category.create({
      data: {
        slug: category.slug,
        name: category.name,
        icon: category.icon,
        order: category.order
      }
    })
    createdCategories[category.slug] = created.id
    console.log(`  ✓ Categoria "${category.name}" creată`)
  }

  // Creează produsele
  console.log('🍽️ Creez produsele...')
  
  for (const product of products) {
    const categoryId = createdCategories[product.categorySlug]
    
    if (!categoryId) {
      console.log(`  ⚠️ Categoria "${product.categorySlug}" nu a fost găsită pentru produsul "${product.name}"`)
      continue
    }

    await prisma.product.create({
      data: {
        productId: product.productId,
        name: product.name,
        description: product.description,
        longDescription: product.longDescription,
        price: product.price,
        image: product.image,
        categoryId: categoryId,
        isPopular: product.isPopular,
        isNew: product.isNew,
        ingredients: product.ingredients,
        allergens: product.allergens,
        preparationTime: product.preparationTime,
        displayTime: product.displayTime,
        calories: product.calories,
        isAvailable: true
      }
    })
    console.log(`  ✓ Produsul "${product.name}" creat (${product.preparationTime} min preparare)`)
  }

  console.log('')
  console.log('✅ Seed-ul s-a finalizat cu succes!')
  console.log(`   - ${categories.length} categorii create`)
  console.log(`   - ${products.length} produse create`)
}

main()
  .catch((e) => {
    console.error('❌ Eroare la seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
