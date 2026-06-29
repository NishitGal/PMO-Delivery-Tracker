const stats = [
  { label: 'On-track initiatives', value: '78%', trend: '+8% vs last month' },
  { label: 'Critical risks', value: '6', trend: '2 escalated' },
  { label: 'Forecasted delay risk', value: '24%', trend: 'AI model active' }
];

const projects = [
  { name: 'Enterprise ERP', owner: 'A. Kumar', status: 'Amber', health: 'Needs attention' },
  { name: 'Data Platform', owner: 'M. Chen', status: 'Green', health: 'Stable delivery' },
  { name: 'Client Portal', owner: 'R. Patel', status: 'Red', health: 'Critical path' }
];

const raids = [
  { id: 'RAID-001', item: 'Vendor dependency', severity: 'High', owner: 'S. Lee' },
  { id: 'RAID-002', item: 'Compliance approval', severity: 'Medium', owner: 'J. Wong' }
];

function App() {
  return (
    <div className="app-shell">
      <header>
        <div>
          <p className="eyebrow">PMO Delivery Tracker</p>
          <h1>Executive command center for delivery health</h1>
        </div>
        <button>Generate weekly report</button>
      </header>

      <section className="stats-grid">
        {stats.map((stat) => (
          <article key={stat.label} className="card">
            <h3>{stat.value}</h3>
            <p>{stat.label}</p>
            <span>{stat.trend}</span>
          </article>
        ))}
      </section>

      <section className="content-grid">
        <article className="card wide">
          <h2>Portfolio snapshot</h2>
          <ul>
            {projects.map((project) => (
              <li key={project.name}>
                <strong>{project.name}</strong>
                <span>{project.owner}</span>
                <span>{project.status}</span>
                <span>{project.health}</span>
              </li>
            ))}
          </ul>
        </article>

        <article className="card">
          <h2>RAID log</h2>
          <ul>
            {raids.map((raid) => (
              <li key={raid.id}>
                <strong>{raid.id}</strong>
                <span>{raid.item}</span>
                <span>{raid.severity}</span>
                <span>{raid.owner}</span>
              </li>
            ))}
          </ul>
        </article>
      </section>
    </div>
  );
}

export default App;
