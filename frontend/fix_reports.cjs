const fs = require('fs');

let c = fs.readFileSync('src/pages/ReportsPage.jsx', 'utf8');

c = c.replace('</ResponsiveCon          <div className="card">', `</ResponsiveContainer>
            </div>
          </div>

          <div className="card">`);

c = c.replace(`        </div> }))
            ]}
          />`, '');

fs.writeFileSync('src/pages/ReportsPage.jsx', c);
