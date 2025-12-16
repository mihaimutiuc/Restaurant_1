const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function cleanChatImages() {
  console.log('🧹 Începe curățarea imaginilor din chat...\n');
  
  try {
    // Găsește toate mesajele cu imagini
    const messagesWithImages = await prisma.message.findMany({
      where: {
        imageUrl: { not: null }
      },
      select: {
        id: true,
        content: true,
        imageUrl: true,
        createdAt: true
      }
    });
    
    console.log(`📊 Găsite ${messagesWithImages.length} mesaje cu imagini\n`);
    
    if (messagesWithImages.length === 0) {
      console.log('✅ Nu există mesaje cu imagini de curățat.');
      return;
    }
    
    // Calculează dimensiunea aproximativă a datelor
    let totalSize = 0;
    for (const msg of messagesWithImages) {
      if (msg.imageUrl) {
        totalSize += msg.imageUrl.length;
      }
    }
    console.log(`📦 Dimensiune totală imagini: ~${(totalSize / 1024 / 1024).toFixed(2)} MB\n`);
    
    // Actualizează toate mesajele - setează imageUrl la null
    const result = await prisma.message.updateMany({
      where: {
        imageUrl: { not: null }
      },
      data: {
        imageUrl: null
      }
    });
    
    console.log(`✅ Curățate ${result.count} mesaje`);
    console.log(`💾 Eliberate aproximativ ${(totalSize / 1024 / 1024).toFixed(2)} MB din baza de date\n`);
    
  } catch (error) {
    console.error('❌ Eroare la curățare:', error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanChatImages();
