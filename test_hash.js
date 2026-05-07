import bcrypt from 'bcrypt';

async function testHash() {
    const isMatch = await bcrypt.compare('password123', '$2b$10$Wvw/Yh1LhN6kO3NfH0x2.eo9Bq/S/YI4K4hB2bJ3uD0K/bL4Z/vN6');
    console.log('Match:', isMatch);
    
    const newHash = await bcrypt.hash('password123', 10);
    console.log('New Hash:', newHash);
}

testHash();
