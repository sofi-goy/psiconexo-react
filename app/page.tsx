import { NuevoPsico } from "./Forms/NuevoPsico";
import { NuevoPaciente } from "./Forms/NuevoPaciente";
import { NuevoTurno } from "./Forms/NuevoTurno";

export default function Home() {
  return (
    <main>
      <NuevoPsico />
      <NuevoPaciente />
      <NuevoTurno />
    </main>
  );
}
