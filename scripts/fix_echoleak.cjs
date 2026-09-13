const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'dehost', 'migrations', '0003_seeds.sql');
let s = fs.readFileSync(filePath, 'utf8');

const target = 'EchoLeak: Zero-Click Vulnerability Exposed Enterprise AI Chat Data';
const idx = s.indexOf(target);
if (idx === -1) {
  console.error('Target not found!');
  process.exit(1);
}

const endIdx = s.indexOf('END $$;', idx);
if (endIdx === -1) {
  console.error('End $$; not found!');
  process.exit(1);
}

// Find preceding indentation/parenthesis
const startIdx = s.lastIndexOf('(', idx);
const badBlock = s.substring(startIdx, endIdx + 7);
console.log('Replacing bad block length:', badBlock.length);

const goodBlock = `(
        'EchoLeak: Zero-Click Vulnerability Exposed Enterprise AI Chat Data',
        'EchoLeak: Sıfır Tıklamayla Kurumsal AI Sohbet Verisi Sızdırıldı',
        'Security researchers disclosed "EchoLeak," a zero-click vulnerability affecting multiple enterprise AI tools that allowed attackers to exfiltrate conversation history without user interaction. Affected vendors have patched the issue, but incident raises questions about AI tool security auditing.',
        'Güvenlik araştırmacıları, kurumsal AI araçlarını etkileyen ve kullanıcı etkileşimi olmadan sohbet geçmişini sızdıran "EchoLeak" adlı sıfır tıklamalı açığı ortaya koydu. Etkilenen satıcılar açığı kapattı.',
        'https://www.securityweek.com',
        'SecurityWeek',
        'security',
        'high',
        false
      );
    END IF;
  END IF;
END $$;`;

s = s.substring(0, startIdx) + goodBlock + s.substring(endIdx + 7);
fs.writeFileSync(filePath, s, 'utf8');
console.log('Successfully fixed EchoLeak in 0003_seeds.sql');
