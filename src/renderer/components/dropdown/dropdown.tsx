import React, { MouseEventHandler } from 'react';

interface DropdownState {
  isOpen: boolean;
  haveText: string | null;
}

class Dropdown extends React.Component<{}, DropdownState> {
  constructor(props: Array<string>) {
    super(props);

    this.state = {
      isOpen: false,
      haveText: 'Server',
    };
  }

  handleClick = () => {
    this.setState((prevState) => ({
      isOpen: !prevState.isOpen,
    }));
  };

  handleText: MouseEventHandler<HTMLDivElement> = (event) => {
    this.setState({
      haveText: event.currentTarget.textContent,
    });
  };

  itemList = (props: Array<string>) => {
    const list = props.map((item) => (
      <div
        onClick={this.handleText}
        onKeyDown={() => {}}
        className="dropdown__item"
        key={item.toString()}
        role="button"
        tabIndex={0}
      >
        {item}
      </div>
    ));

    return <div className="dropdown__items"> {list} </div>;
  };

  render() {
    const { isOpen, haveText } = this.state;

    return (
      // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
      <div
        className={isOpen ? 'dropdown active' : 'dropdown'}
        onClick={this.handleClick}
      >
        <div className="dropdown__text">
          {!haveText ? 'Select Type' : haveText}
        </div>
        {this.itemList(['Admin', 'Server'])}
      </div>
    );
  }
}

export default Dropdown;
