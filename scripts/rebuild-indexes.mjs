import * as fs from 'fs';
import * as path from 'path';

function main() {
  const metadataDir = path.resolve('output/metadata');
  const indexesDir = path.resolve('output/indexes');

  if (!fs.existsSync(metadataDir)) {
    console.log(` ⚠️ Metadata directory ${metadataDir} missing. Run processing first.`);
    return;
  }

  fs.mkdirSync(indexesDir, { recursive: true });
  const files = fs.readdirSync(metadataDir).filter((f) => f.endsWith('.json'));

  console.log(`\n📊 [Rebuild Indexes] Reading ${files.length} metadata JSON files...`);

  const allProjects = [];
  const featuredProjects = [];
  const techMap = new Map();
  const categoryMap = new Map();

  for (const file of files) {
    const raw = fs.readFileSync(path.join(metadataDir, file), 'utf-8');
    const project = JSON.parse(raw);

    const summary = {
      _id: project._id,
      title: project.title,
      slug: project.slug,
      shortDescription: project.shortDescription,
      category: project.category,
      isFeatured: project.isFeatured,
      githubUrl: project.githubUrl,
      techStackBreakdown: project.techStackBreakdown,
    };

    allProjects.push(summary);
    if (project.isFeatured) {
      featuredProjects.push(summary);
    }

    // Categories
    const cat = project.category || 'Practice';
    const catList = categoryMap.get(cat) || [];
    catList.push(project.slug);
    categoryMap.set(cat, catList);

    // Technologies
    const techs = Object.values(project.techStackBreakdown || {}).flat();
    for (const t of techs) {
      const count = techMap.get(t) || 0;
      techMap.set(t, count + 1);
    }
  }

  // Write all-projects.json
  fs.writeFileSync(path.join(indexesDir, 'all-projects.json'), JSON.stringify(allProjects, null, 2));

  // Write featured-projects.json
  fs.writeFileSync(path.join(indexesDir, 'featured-projects.json'), JSON.stringify(featuredProjects, null, 2));

  // Write categories.json
  const categoriesObj = {};
  for (const [k, v] of categoryMap.entries()) categoriesObj[k] = v;
  fs.writeFileSync(path.join(indexesDir, 'categories.json'), JSON.stringify(categoriesObj, null, 2));

  // Write technologies.json
  const techObj = {};
  for (const [k, v] of techMap.entries()) techObj[k] = v;
  fs.writeFileSync(path.join(indexesDir, 'technologies.json'), JSON.stringify(techObj, null, 2));

  console.log(` ✅ Successfully compiled 4 index files in ${indexesDir}`);
}

main();
