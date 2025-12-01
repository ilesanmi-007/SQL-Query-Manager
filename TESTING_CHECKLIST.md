# Testing Checklist

## 🗄️ Database Migration (Do This First!)

- [ ] Backup your current database
- [ ] Run the migration script: `migration-add-status.sql`
- [ ] Verify the `status` column was added to `queries` table
- [ ] Check that existing queries have `status = 'published'`

## 🔐 Admin Dashboard

### Statistics Cards
- [ ] Navigate to Admin dashboard
- [ ] Verify 4 cards are displayed:
  - [ ] Total Users
  - [ ] Total Queries
  - [ ] Private Queries (count matches)
  - [ ] Public Queries (count matches)

### Users Tab
- [ ] Click on "Users" tab
- [ ] For each user, verify you see:
  - [ ] Total queries count
  - [ ] Public queries count (cyan badge)
  - [ ] Private queries count (purple badge)
- [ ] Verify counts are accurate

### Queries Tab
- [ ] Click on "All Queries" tab (formerly "Queries")
- [ ] Verify each query shows:
  - [ ] 🌐 Public badge (cyan) for public queries
  - [ ] 🔒 Private badge (purple) for private queries
- [ ] Verify all queries (both public and private) are shown

## ✍️ Write Query Page

### Navigation
- [ ] Check navigation shows "Write Query" (not "New Query")
- [ ] Check "All Queries" link (not "Saved Queries")

### Draft Feature
- [ ] Scroll to "Status" section
- [ ] Verify two toggle buttons:
  - [ ] 📝 Draft (amber when selected)
  - [ ] ✓ Published (green when selected)
- [ ] Select "Draft" and save a query
- [ ] Select "Published" and save a query
- [ ] Verify both queries are saved correctly

## 📋 All Queries Page

### Navigation
- [ ] Page title shows "All Queries" (not "Saved Queries")
- [ ] Subtitle mentions "both private and public"

### Status Filter
- [ ] Verify status filter dropdown exists
- [ ] Test "All Status" - shows all queries
- [ ] Test "📝 Drafts" - shows only draft queries
- [ ] Test "✓ Published" - shows only published queries
- [ ] Verify filter works with search and date filters

### Query Cards
- [ ] Draft queries show "📝 Draft" badge (amber)
- [ ] Published queries don't show status badge
- [ ] Verify visibility badges still work (🌐/🔒)
- [ ] Verify favorite stars still show (⭐)

## 🌐 Public Queries Page

### Navigation
- [ ] Check "Write Query" link (not "New Query")
- [ ] Check "All Queries" link (not "Saved Queries")

## 🔄 Cross-Page Consistency

- [ ] All pages use same navigation labels
- [ ] Navigation is consistent across:
  - [ ] Write Query page
  - [ ] All Queries page
  - [ ] Public Queries page
  - [ ] Admin page

## 🎨 Visual Verification

### Color Coding
- [ ] Public badges are cyan
- [ ] Private badges are purple
- [ ] Draft badges are amber
- [ ] Favorite stars are yellow

### Responsive Design
- [ ] Test on desktop
- [ ] Test on tablet (if applicable)
- [ ] Test on mobile (if applicable)

## 🐛 Edge Cases

- [ ] Create query without selecting status (should default to published)
- [ ] Filter by draft when no drafts exist
- [ ] User with 0 queries shows correct statistics
- [ ] Admin can see all users' queries (both public and private)
- [ ] Non-admin users only see their own queries in "All Queries"

## ✅ Final Verification

- [ ] No console errors
- [ ] All features work as expected
- [ ] Navigation is intuitive
- [ ] Statistics are accurate
- [ ] Filters work correctly
- [ ] Draft functionality works for all users

## 📝 Notes

Record any issues found:
```
Issue 1: 
Issue 2: 
Issue 3: 
```

## 🎉 Success Criteria

All checkboxes above should be checked ✅ before considering the implementation complete.
