import React from 'react';
import ReactDOM from 'react-dom';
import styled from "styled-components";
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import Close from "./icons/Close";
import Down from "./icons/Down";
import Reorder from "./icons/Reorder";

class App extends React.Component {
  constructor(props) {
    super(props);
    const data = [];
    this.state = {
      data,
      count: '',
      prevCount: '',
      items: this.getItems(data),
      showScrollBtn: false,
    };

    this.mounted = false;
    this.isDragging = false;
    this.scrollView = React.createRef();

    this.onDragEnd = this.onDragEnd.bind(this);
  }

  componentDidMount() {
    this.scrollToBottom();
    ReactDOM.findDOMNode(this.contentWrapper).addEventListener('scroll', this.handleScroll.bind(this));
  }

  componentDidUpdate(prevProps, prevState) {
   if(!this.isDragging) {
     this.scrollToBottom();
   }
  }

  componentWillUnmount() {
    ReactDOM.findDOMNode(this.contentWrapper).removeEventListener('scroll', this.handleScroll.bind(this));
  }

  handleScroll(e) {
    const height = e.target.scrollHeight - e.target.clientHeight - 200;
    if (!this.state.hasScrolled && e.target.scrollTop < height) {
      this.setState({ hasScrolled: true });
    } else if(this.state.hasScrolled && e.target.scrollTop > height) {
      this.setState({ hasScrolled: false });
    }
    this.isDragging = false;
    this.mounted = true;
  }

  updateItems = () => {
    const items = this.getItems(this.state.data);
    const prevCount = this.state.data[this.state.data.length - 1].id + 1;
    this.setState({ items, prevCount, count: '' });
  }

  scrollToBottom = () => {
    this.scrollView.current.scrollIntoView({ behavior: "smooth" });
  }

  // Create the Draggable item box
  getItems(data) {
    return data.map((d) => ({
      id: `item-${d.id}`,
      content: (
          <StyledItem>
            <StyledItemInput
              type="text"
              placeholder={d.placeholder}
              value={d.value}
              onChange={(e) => {
                const data = this.state.data;
                const dt = data.find(dt => dt.id === d.id);
                dt.value = e.target.value;
                this.setState({ data });
                this.updateItems();
              }}
            />
            <div onClick={(e) => this.handleDelete(e, d)}><Close /></div>
          </StyledItem>
      ),
    }));
  };

  // delete the generated item
  handleDelete = (e, d) => {
    e.stopPropagation();
    const data = this.state.data;
    const index = data.indexOf(data.find(dt => dt.id === d.id));
    data.splice(index, 1);
    this.setState({ data });
    this.updateItems();
  }

  reorder = (list, startIndex, endIndex) => {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);

    return result;
  };

  onDragEnd(result) {
    if (!result.destination) {
      return;
    }

    const items = this.reorder(
        this.state.items,
        result.source.index,
        result.destination.index
    );

    this.setState({
      items
    });
    this.isDragging = true;
  }

  // generate number of Items
  addItem = () => {
    if (!this.state.count) return;
    const data = this.state.data;
    const prevCount = this.state.prevCount || 0;
    Array.from({ length: this.state.count }, (v, k) => k).map(c => data.push({id: (c + prevCount), placeholder: `item-${c + prevCount}`, value: ''}));
    this.setState({ data });
    this.updateItems();
  };

  handleCountChange = (e) => {
    let count = e.target.value;

    if (!Number(count)) {
      return;
    }
    this.setState({count: parseInt(count, 10)})
  }

  reset = () => {
    this.setState(state => {
      const items = this.getItems([]);
      return { items, prevCount: '', count: '', data: [] };
    })
  }

  render() {
    return (
        <Wrapper className="App">
          <StyledHeader>
            <StyledInput
                type="text"
                placeholder='# of items'
                value={this.state.count}
                onChange={this.handleCountChange}
            />
            <StyledButton onClick={this.addItem}>Generate</StyledButton>
            <StyledButton onClick={this.reset}>Reset</StyledButton>
          </StyledHeader>
          <StyledWrapper>
            <StyledContentWrapper ref={element => this.contentWrapper = element} hasData={this.state.data.length > 0}>
              <DragDropContext onDragEnd={this.onDragEnd}>
                <Droppable droppableId="droppable">
                  {(provided, snapshot) => (
                      <div
                          {...provided.droppableProps}
                          ref={provided.innerRef}
                      >
                        {this.state.items.map((item, index) => (
                            <Draggable key={item.id} draggableId={item.id} index={index}>
                              {(provided, snapshot) => (
                                  <div
                                      ref={provided.innerRef}
                                      {...provided.draggableProps}
                                      {...provided.dragHandleProps}
                                  >
                                    <div className='item-box' key={item.id}>
                                      <span {...provided.dragHandleProps}><Reorder className='icon-reorder' /></span>
                                      {item.content}
                                    </div>
                                  </div>
                              )}
                            </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                  )}
                </Droppable>
              </DragDropContext>
              <div ref={this.scrollView} />
            </StyledContentWrapper>
            {this.mounted && this.state.hasScrolled && <StyledDownArrow onClick={this.scrollToBottom}><Down/></StyledDownArrow>}
          </StyledWrapper>
        </Wrapper>
    );
  }
}

const Wrapper = styled.div`
    width: 400px;
    overflow: hidden;
    padding: 12px 24px;
`;

const StyledContentWrapper = styled.div`
    width: 90%;
    height: auto;
    max-height: 64vh;
    overflow: auto;
    border-radius: 4px;
    background: ${p => p.theme.grey10};

    div[data-rbd-droppable-id] {
      overflow-y: auto;
      overflow-x: hidden;
    }
    ${props => props.hasData && `
      div[data-rbd-droppable-id] {
        padding: 12px;
      }
    `};

    div[data-rbd-draggable-context-id] {
      background: ${p => p.theme.white};
      border-radius: 4px;
      margin: 8px;
      &:first-child{
        margin-top: 0;
      }
      &:last-child{
        margin-bottom: 0;
      }
    }

    .item-box {
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      align-items: center;
    }
`;

const StyledHeader = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;

const StyledButton = styled.button`
  height: ${p => p.theme.headerHeight};
  min-width: 80px;
  background: ${p => p.theme.red};
  color: ${p => p.theme.white};
  border: 1px solid ${p => p.theme.red};
  border-radius: 4px;
  outline: 0;
  margin-left: 12px;
  cursor: pointer;
`;

const StyledWrapper = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  margin-top: 24px;
`;

const StyledDownArrow = styled.div`
  height: 24px;
  width: 24px;
  background: ${p => p.theme.red};
  border-radius: 25px;
  cursor: pointer;
  svg * {
    fill: ${p => p.theme.white};
  }
`;

const StyledInput = styled.input`
  font-size: ${p => p.theme.font12};
  border: ${p => p.theme.inputBorder};
  border-radius: 4px;
  padding: 0 8px;
  height: ${p => p.theme.headerHeight};
  outline: 0;
`;

const StyledItem = styled.div`
  width: 90%;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: flex-start;
  padding: 4px 4px 4px 12px;

  .icon {
    height: 20px;
    width: 20px;
    background: ${p => p.theme.red};
    padding: 1px;
    box-sizing: border-box;
    border-radius: 2px;
    cursor: pointer;
    svg {
      fill: ${p => p.theme.white};
    }
  }
`;

const StyledItemInput = styled.input`
  height: auto;
  width: 90%;
  font-size: ${p => p.theme.font16};
  border-radius: 4px;
  outline: 0;
  border: 0;
`;

export default App;
