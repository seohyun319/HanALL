import { useState } from "react";
import { Button } from "../src/component/Button/Button";
import { Input } from "../src/component/Input/Input";
import { join } from "../src/services/auth-service";
import { JoinInputs } from "../types/auth";

export default function Join() {
  const initialValues: JoinInputs = { email: "", password: "", nickname: "" };
  const [inputs, setInputs] = useState<JoinInputs>(initialValues);

  const handleInputChange = (e: React.ChangeEvent<any>) => {
    e.persist();
    setInputs({
      ...inputs,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    const res = await join(inputs);
    console.log(res);
  };

  return (
    <form onSubmit={handleSubmit}>
      <style jsx>{`
        form {
          display: flex;
          height: 90vh;
          align-items: center;
          justify-content: center;
          align-content: center;
          flex-direction: column;
          margin: 5px 0px;
        }
      `}</style>
      <Input
        type="email"
        name="email"
        placeholder="ID"
        onChange={handleInputChange}
        value={inputs.email}
      />
      <Input
        type="password"
        name="password"
        placeholder="Password"
        onChange={handleInputChange}
        value={inputs.password}
      />
      <Input
        type="nickname"
        name="nickname"
        placeholder="nickname"
        onChange={handleInputChange}
        value={inputs.nickname}
      />
      <Button type="submit">join</Button>
    </form>
  );
}
