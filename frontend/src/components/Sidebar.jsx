import "../styles/Sidebar.css";

function Sidebar() {
  return (
    <aside className="sidebar">

      <div className="sidebar-logo">
        TaskMS
      </div>

      <nav className="sidebar-menu">

        <a
          href="#"
          className="sidebar-link active"
        >
          Tasks
        </a>

      </nav>

    </aside>
  );
}

export default Sidebar;