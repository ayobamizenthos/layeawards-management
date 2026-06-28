export function SetupNotice() {
  return (
    <div className="notice">
      <h2>One quick setup step</h2>
      <p>
        The dashboard needs your Supabase keys before it can load data. This takes about two
        minutes.
      </p>
      <ol>
        <li>
          Create a free project at <a href="https://supabase.com">supabase.com</a>.
        </li>
        <li>
          Open the SQL editor and run the script in <code>supabase/schema.sql</code>.
        </li>
        <li>
          Copy <code>.env.example</code> to <code>.env</code> and paste in your project URL and anon
          key.
        </li>
        <li>
          Restart the dev server (<code>npm run dev</code>).
        </li>
      </ol>
    </div>
  )
}
