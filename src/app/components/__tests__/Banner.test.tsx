import { render, screen } from "@testing-library/react";
import Banner from "../Banner";

describe("Banner", () => {
  it("renders the banner text when set", () => {
    render(<Banner text="Raffle on until 1st October" />);
    expect(screen.getByText("Raffle on until 1st October")).toBeInTheDocument();
  });

  it("renders nothing when the text is undefined", () => {
    const { container } = render(<Banner />);
    expect(container).toBeEmptyDOMElement();
  });

  it("renders nothing when the text is null", () => {
    const { container } = render(<Banner text={null} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("renders nothing when the text is only whitespace", () => {
    const { container } = render(<Banner text="   " />);
    expect(container).toBeEmptyDOMElement();
  });
});
