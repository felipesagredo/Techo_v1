function Header({ user }) {

  return (

    <header className="main-header">

      <h1>

        Bienvenido, {user.name}

      </h1>

      <div className="user-profile">

        <div className="avatar">

          {user.name.charAt(0).toUpperCase()}

        </div>

        <div>

          <strong>

            {user.name}

          </strong>

          <p
            style={{
              margin: 0,
              color: '#666',
              fontSize: '.9rem'
            }}
          >

            {user.email}

          </p>

        </div>

      </div>

    </header>

  )

}

export default Header