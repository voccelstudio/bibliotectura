const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, 'data');

const mergeFiles = (baseFile, extraFile) => {
    const basePath = path.join(dataDir, baseFile);
    const extraPath = path.join(dataDir, extraFile);
    
    if (fs.existsSync(basePath) && fs.existsSync(extraPath)) {
        console.log(`Merging ${baseFile} and ${extraFile}`);
        
        // Handle direct arrays or object arrays based on file structure
        let baseData = JSON.parse(fs.readFileSync(basePath, 'utf8'));
        let extraData = JSON.parse(fs.readFileSync(extraPath, 'utf8'));
        
        // If they are both arrays
        if (Array.isArray(baseData) && Array.isArray(extraData)) {
            // merge and remove duplicates by ID
            const combined = [...baseData];
            const existingIds = new Set(baseData.map(item => item.id));
            
            for (const item of extraData) {
                if (!existingIds.has(item.id)) {
                    combined.push(item);
                    existingIds.add(item.id);
                } else {
                    console.log(`- Duplicate ID found/skipped: ${item.id}`);
                }
            }
            fs.writeFileSync(basePath, JSON.stringify(combined, null, 2), 'utf8');
            console.log(`- Wrote ${combined.length} items to ${baseFile}`);
            
            // Delete extra files after merge to clean up
            fs.unlinkSync(extraPath);
        } else {
            console.log(`Could not merge ${baseFile} (Not both arrays)`);
        }
    }
};

mergeFiles('estilos.json', 'estilos-extra.json');
mergeFiles('interiores.json', 'interiores-extra.json');
mergeFiles('materiales.json', 'materiales-extra.json');

console.log("Merge completed.");
