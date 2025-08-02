const fs = require('fs');
const path = require('path');
const glob = require('glob');

// 파일별 수정 내용
const fixes = [
  {
    file: 'src/components/chat/ChatRoom.tsx',
    replacements: [
      {
        find: "import { useAuth } from '@/hooks/useAuth';",
        replace: "import { useAuthStore } from '@/store/authStore';"
      },
      {
        find: "const { user } = useAuth();",
        replace: "const user = useAuthStore((state) => state.user);"
      }
    ]
  },
  {
    file: 'src/app/explore/users/page.tsx',
    replacements: [
      {
        find: "import { useAuth } from '@/contexts/AuthContext'",
        replace: "import { useAuthStore } from '@/store/authStore'"
      },
      {
        find: "const { user } = useAuth()",
        replace: "const user = useAuthStore((state) => state.user)"
      }
    ]
  },
  {
    file: 'src/components/resources/BookmarkButton.tsx',
    replacements: [
      {
        find: "import { useAuth } from '@/contexts/AuthContext'",
        replace: "import { useAuthStore } from '@/store/authStore'"
      },
      {
        find: "const { user } = useAuth()",
        replace: "const user = useAuthStore((state) => state.user)"
      }
    ]
  },
  {
    file: 'src/components/layout/DashboardNav.tsx',
    replacements: [
      {
        find: "import { useAuth } from '@/contexts/AuthContext';",
        replace: "import { useAuthStore } from '@/store/authStore';"
      },
      {
        find: "const { user } = useAuth();",
        replace: "const user = useAuthStore((state) => state.user);"
      }
    ]
  },
  {
    file: 'src/components/FollowButton.tsx',
    replacements: [
      {
        find: "import { useAuth } from '@/contexts/AuthContext'",
        replace: "import { useAuthStore } from '@/store/authStore'"
      },
      {
        find: "const { user } = useAuth()",
        replace: "const user = useAuthStore((state) => state.user)"
      }
    ]
  },
  {
    file: 'src/components/dashboard/SuggestedFollows.tsx',
    replacements: [
      {
        find: "import { useAuth } from '@/contexts/AuthContext'",
        replace: "import { useAuthStore } from '@/store/authStore'"
      },
      {
        find: "const { user } = useAuth()",
        replace: "const user = useAuthStore((state) => state.user)"
      }
    ]
  }
];

console.log('🔧 Fixing auth usage in files...\n');

fixes.forEach(({ file, replacements }) => {
  const filePath = path.join(__dirname, file);
  
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  File not found: ${file}`);
      return;
    }

    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    replacements.forEach(({ find, replace }) => {
      if (content.includes(find)) {
        content = content.replace(new RegExp(find.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), replace);
        modified = true;
        console.log(`✅ Fixed in ${file}: ${find.substring(0, 50)}...`);
      }
    });

    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
    } else {
      console.log(`✔️  No changes needed in ${file}`);
    }
  } catch (error) {
    console.log(`❌ Error processing ${file}: ${error.message}`);
  }
});

console.log('\n✨ Auth usage fixes completed!');
