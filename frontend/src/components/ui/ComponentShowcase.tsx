import React, { useState } from 'react';
import { 
  Button, 
  Card, 
  CardHeader, 
  CardBody, 
  CardFooter,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Badge,
  useToast
} from './index';

const ComponentShowcase: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { addToast } = useToast();

  const sampleData = [
    { id: 1, name: '김철수', role: '회원', status: 'active' },
    { id: 2, name: '이영희', role: '트레이너', status: 'inactive' },
    { id: 3, name: '박민수', role: '관리자', status: 'active' },
  ];

  const handleToast = (type: 'success' | 'error' | 'warning' | 'info') => {
    addToast({
      type,
      title: `${type.toUpperCase()} 알림`,
      message: `이것은 ${type} 타입의 토스트 메시지입니다.`,
      duration: 3000
    });
  };

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="mb-8">
        <h1 className="text-display-lg font-bold text-gray-900 mb-2">
          UI 컴포넌트 라이브러리
        </h1>
        <p className="text-body-lg text-gray-600">
          새로 구축된 재사용 가능한 컴포넌트들을 확인해보세요.
        </p>
      </div>

      {/* Buttons Section */}
      <Card>
        <CardHeader>
          <h2 className="text-title-lg font-semibold">Buttons</h2>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="gym">Gym</Button>
            <Button variant="danger">Danger</Button>
            <Button variant="success">Success</Button>
            <Button variant="warning">Warning</Button>
            <Button variant="ghost">Ghost</Button>
            <Button loading>Loading</Button>
            
            <Button size="sm" variant="primary">Small</Button>
            <Button size="md" variant="primary">Medium</Button>
            <Button size="lg" variant="primary">Large</Button>
            <Button 
              variant="primary" 
              icon={<span>🔥</span>}
            >
              With Icon
            </Button>
          </div>
        </CardBody>
      </Card>

      {/* Cards Section */}
      <Card>
        <CardHeader>
          <h2 className="text-title-lg font-semibold">Cards</h2>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card variant="default">
              <CardBody>
                <h3 className="font-semibold mb-2">Default Card</h3>
                <p className="text-sm text-gray-600">기본 카드 스타일입니다.</p>
              </CardBody>
            </Card>
            
            <Card variant="elevated">
              <CardBody>
                <h3 className="font-semibold mb-2">Elevated Card</h3>
                <p className="text-sm text-gray-600">그림자가 있는 카드입니다.</p>
              </CardBody>
            </Card>
            
            <Card variant="outlined" hover>
              <CardBody>
                <h3 className="font-semibold mb-2">Hover Card</h3>
                <p className="text-sm text-gray-600">호버 효과가 있는 카드입니다.</p>
              </CardBody>
            </Card>
          </div>
        </CardBody>
      </Card>

      {/* Badges Section */}
      <Card>
        <CardHeader>
          <h2 className="text-title-lg font-semibold">Badges</h2>
        </CardHeader>
        <CardBody>
          <div className="flex flex-wrap gap-3">
            <Badge variant="primary">Primary</Badge>
            <Badge variant="secondary">Secondary</Badge>
            <Badge variant="success">Success</Badge>
            <Badge variant="danger">Danger</Badge>
            <Badge variant="warning">Warning</Badge>
            <Badge variant="gym">Gym</Badge>
            
            <Badge variant="primary" outline>Primary Outline</Badge>
            <Badge variant="success" outline>Success Outline</Badge>
            
            <Badge variant="primary" size="sm">Small</Badge>
            <Badge variant="primary" size="md">Medium</Badge>
            <Badge variant="primary" size="lg">Large</Badge>
          </div>
        </CardBody>
      </Card>

      {/* Table Section */}
      <Card>
        <CardHeader>
          <h2 className="text-title-lg font-semibold">Table</h2>
        </CardHeader>
        <CardBody>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead sortable>ID</TableHead>
                <TableHead sortable>이름</TableHead>
                <TableHead>역할</TableHead>
                <TableHead>상태</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sampleData.map((item) => (
                <TableRow key={item.id} hover>
                  <TableCell>{item.id}</TableCell>
                  <TableCell editable onEdit={(value) => console.log('Edit:', value)}>
                    {item.name}
                  </TableCell>
                  <TableCell>{item.role}</TableCell>
                  <TableCell>
                    <Badge 
                      variant={item.status === 'active' ? 'success' : 'secondary'}
                      size="sm"
                    >
                      {item.status === 'active' ? '활성' : '비활성'}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardBody>
      </Card>

      {/* Modal & Toast Section */}
      <Card>
        <CardHeader>
          <h2 className="text-title-lg font-semibold">Modal & Toast</h2>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <Button onClick={() => setIsModalOpen(true)}>
              Open Modal
            </Button>
            <Button onClick={() => handleToast('success')} variant="success">
              Success Toast
            </Button>
            <Button onClick={() => handleToast('error')} variant="danger">
              Error Toast
            </Button>
            <Button onClick={() => handleToast('warning')} variant="warning">
              Warning Toast
            </Button>
            <Button onClick={() => handleToast('info')}>
              Info Toast
            </Button>
          </div>
        </CardBody>
      </Card>

      {/* Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        size="md"
      >
        <ModalHeader onClose={() => setIsModalOpen(false)}>
          <h3 className="text-title-lg font-semibold">Modal 예제</h3>
        </ModalHeader>
        <ModalBody>
          <p className="text-body-md text-gray-600 mb-4">
            이것은 새로운 Modal 컴포넌트의 예제입니다.
          </p>
          <div className="space-y-3">
            <Badge variant="gym">헬스장 테마</Badge>
            <p className="text-body-sm">
              ESC 키를 누르거나 배경을 클릭해서 닫을 수 있습니다.
            </p>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
            취소
          </Button>
          <Button variant="primary" onClick={() => setIsModalOpen(false)}>
            확인
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default ComponentShowcase; 